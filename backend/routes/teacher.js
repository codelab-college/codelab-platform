import express from 'express';
import { auth, teacherOnly } from '../middleware/auth.js';

const router = express.Router();

// ==================== TEACHER DASHBOARD ====================

// Get teacher dashboard stats
router.get('/dashboard', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;

    // Get total assignments
    const assignmentsCount = await db.get(`
      SELECT COUNT(*) as count 
      FROM assignments 
      WHERE teacher_id = ?
    `, [teacherId]);

    // Get active assignments
    const activeAssignments = await db.get(`
      SELECT COUNT(*) as count 
      FROM assignments 
      WHERE teacher_id = ? AND status = 'active'
    `, [teacherId]);

    // Get total problems
    const problemsCount = await db.get(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM problems p
      JOIN assignments a ON p.assignment_id = a.id
      WHERE a.teacher_id = ?
    `, [teacherId]);

    // Get total submissions
    const submissionsCount = await db.get(`
      SELECT COUNT(*) as count
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.teacher_id = ?
    `, [teacherId]);

    // Get recent submissions
    const recentSubmissions = await db.all(`
      SELECT 
        s.id,
        s.verdict,
        s.score,
        s.submitted_at,
        u.name as student_name,
        u.usn,
        p.title as problem_title,
        a.title as assignment_title
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN problems p ON s.problem_id = p.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.teacher_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT 10
    `, [teacherId]);

    // Get assignments with submission stats
    const assignmentStats = await db.all(`
      SELECT 
        a.id,
        a.title,
        a.due_date,
        a.status,
        COUNT(DISTINCT sa.student_id) as students_submitted,
        COUNT(DISTINCT CASE WHEN sa.status = 'completed' THEN sa.student_id END) as students_completed,
        AVG(sa.score) as average_score
      FROM assignments a
      LEFT JOIN student_assignments sa ON a.id = sa.assignment_id
      WHERE a.teacher_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [teacherId]);

    res.json({
      stats: {
        totalAssignments: assignmentsCount.count,
        activeAssignments: activeAssignments.count,
        totalProblems: problemsCount.count,
        totalSubmissions: submissionsCount.count
      },
      recentSubmissions,
      assignmentStats
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ==================== ASSIGNMENT MANAGEMENT ====================

// Get all assignments for teacher
router.get('/assignments', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;

    const assignments = await db.all(`
      SELECT 
        a.*,
        COUNT(DISTINCT p.id) as problem_count,
        COUNT(DISTINCT sa.student_id) as students_attempted,
        COUNT(DISTINCT CASE WHEN sa.status = 'completed' THEN sa.student_id END) as students_completed
      FROM assignments a
      LEFT JOIN problems p ON a.id = p.assignment_id
      LEFT JOIN student_assignments sa ON a.id = sa.assignment_id
      WHERE a.teacher_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `, [teacherId]);

    res.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get single assignment details
router.get('/assignments/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const assignmentId = req.params.id;

    const assignment = await db.get(`
      SELECT * FROM assignments 
      WHERE id = ? AND teacher_id = ?
    `, [assignmentId, teacherId]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Get problems
    const problems = await db.all(`
      SELECT 
        p.*,
        COUNT(DISTINCT tc.id) as test_case_count,
        COUNT(DISTINCT s.id) as submission_count
      FROM problems p
      LEFT JOIN test_cases tc ON p.id = tc.problem_id
      LEFT JOIN submissions s ON p.id = s.problem_id
      WHERE p.assignment_id = ?
      GROUP BY p.id
      ORDER BY p.order_index ASC
    `, [assignmentId]);

    res.json({ assignment, problems });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Create new assignment
router.post('/assignments', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const {
      title,
      description,
      due_date,
      is_timed,
      duration_minutes,
      total_marks,
      detect_violations,
      allowed_languages,
      access_type,
      selected_students
    } = req.body;

    const result = await db.run(`
      INSERT INTO assignments (
        title, description, teacher_id, due_date, is_timed, 
        duration_minutes, total_marks, detect_violations, allowed_languages,
        access_type, selected_students
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description,
      teacherId,
      due_date,
      is_timed || 0,
      duration_minutes,
      total_marks || 100,
      detect_violations !== undefined ? detect_violations : 1,
      allowed_languages || 'python,javascript,cpp',
      access_type || 'all',
      selected_students || null
    ]);

    const assignment = await db.get(`
      SELECT * FROM assignments WHERE id = ?
    `, [result.lastID]);

    res.status(201).json({ assignment });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Update assignment
router.put('/assignments/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const assignmentId = req.params.id;
    const {
      title,
      description,
      due_date,
      is_timed,
      duration_minutes,
      total_marks,
      status,
      detect_violations,
      is_hidden,
      allowed_languages,
      access_type,
      selected_students
    } = req.body;

    // Verify ownership
    const existing = await db.get(`
      SELECT id FROM assignments WHERE id = ? AND teacher_id = ?
    `, [assignmentId, teacherId]);

    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await db.run(`
      UPDATE assignments 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        due_date = COALESCE(?, due_date),
        is_timed = COALESCE(?, is_timed),
        duration_minutes = COALESCE(?, duration_minutes),
        total_marks = COALESCE(?, total_marks),
        status = COALESCE(?, status),
        detect_violations = COALESCE(?, detect_violations),
        is_hidden = COALESCE(?, is_hidden),
        allowed_languages = COALESCE(?, allowed_languages),
        access_type = COALESCE(?, access_type),
        selected_students = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title,
      description,
      due_date,
      is_timed,
      duration_minutes,
      total_marks,
      status,
      detect_violations,
      is_hidden,
      allowed_languages,
      access_type,
      selected_students !== undefined ? selected_students : null,
      assignmentId
    ]);

    const assignment = await db.get(`
      SELECT * FROM assignments WHERE id = ?
    `, [assignmentId]);

    res.json({ assignment });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Delete assignment
router.delete('/assignments/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const assignmentId = req.params.id;

    // Verify ownership
    const existing = await db.get(`
      SELECT id FROM assignments WHERE id = ? AND teacher_id = ?
    `, [assignmentId, teacherId]);

    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await db.run(`DELETE FROM assignments WHERE id = ?`, [assignmentId]);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// ==================== PROBLEM MANAGEMENT ====================

// Create problem
router.post('/problems', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const {
      assignment_id,
      title,
      description,
      input_format,
      output_format,
      constraints,
      difficulty,
      marks,
      time_limit,
      memory_limit,
      order_index
    } = req.body;

    // Verify assignment ownership
    const assignment = await db.get(`
      SELECT id FROM assignments WHERE id = ? AND teacher_id = ?
    `, [assignment_id, teacherId]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const result = await db.run(`
      INSERT INTO problems (
        assignment_id, title, description, input_format, output_format,
        constraints, difficulty, marks, time_limit, memory_limit, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      assignment_id,
      title,
      description,
      input_format,
      output_format,
      constraints,
      difficulty || 'medium',
      marks || 10,
      time_limit || 1000,
      memory_limit || 256,
      order_index || 0
    ]);

    const problem = await db.get(`
      SELECT * FROM problems WHERE id = ?
    `, [result.lastID]);

    res.status(201).json({ problem });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// Update problem
router.put('/problems/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const problemId = req.params.id;
    const {
      title,
      description,
      input_format,
      output_format,
      constraints,
      difficulty,
      marks,
      time_limit,
      memory_limit,
      order_index
    } = req.body;

    // Verify ownership through assignment
    const problem = await db.get(`
      SELECT p.id FROM problems p
      JOIN assignments a ON p.assignment_id = a.id
      WHERE p.id = ? AND a.teacher_id = ?
    `, [problemId, teacherId]);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    await db.run(`
      UPDATE problems 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        input_format = COALESCE(?, input_format),
        output_format = COALESCE(?, output_format),
        constraints = COALESCE(?, constraints),
        difficulty = COALESCE(?, difficulty),
        marks = COALESCE(?, marks),
        time_limit = COALESCE(?, time_limit),
        memory_limit = COALESCE(?, memory_limit),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `, [
      title,
      description,
      input_format,
      output_format,
      constraints,
      difficulty,
      marks,
      time_limit,
      memory_limit,
      order_index,
      problemId
    ]);

    const updated = await db.get(`
      SELECT * FROM problems WHERE id = ?
    `, [problemId]);

    res.json({ problem: updated });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// Delete problem
router.delete('/problems/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const problemId = req.params.id;

    // Verify ownership through assignment
    const problem = await db.get(`
      SELECT p.id FROM problems p
      JOIN assignments a ON p.assignment_id = a.id
      WHERE p.id = ? AND a.teacher_id = ?
    `, [problemId, teacherId]);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    await db.run(`DELETE FROM problems WHERE id = ?`, [problemId]);

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// Get problem with test cases
router.get('/problems/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const problemId = req.params.id;

    // Verify ownership
    const problem = await db.get(`
      SELECT p.* FROM problems p
      JOIN assignments a ON p.assignment_id = a.id
      WHERE p.id = ? AND a.teacher_id = ?
    `, [problemId, teacherId]);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Get all test cases
    const testCases = await db.all(`
      SELECT * FROM test_cases 
      WHERE problem_id = ?
      ORDER BY is_sample DESC, id ASC
    `, [problemId]);

    res.json({ problem, testCases });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// ==================== TEST CASE MANAGEMENT ====================

// Add test case
router.post('/test-cases', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const { problem_id, input, expected_output, is_sample, marks } = req.body;

    // Verify ownership
    const problem = await db.get(`
      SELECT p.id FROM problems p
      JOIN assignments a ON p.assignment_id = a.id
      WHERE p.id = ? AND a.teacher_id = ?
    `, [problem_id, teacherId]);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const result = await db.run(`
      INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, marks)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [problem_id, input, expected_output, is_sample || 0, is_sample ? 0 : 1, marks || 1]);

    const testCase = await db.get(`
      SELECT * FROM test_cases WHERE id = ?
    `, [result.lastID]);

    res.status(201).json({ testCase });
  } catch (error) {
    console.error('Error creating test case:', error);
    res.status(500).json({ error: 'Failed to create test case' });
  }
});

// Update test case
router.put('/test-cases/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const testCaseId = req.params.id;
    const { input, expected_output, is_sample, marks } = req.body;

    // Verify ownership
    const testCase = await db.get(`
      SELECT tc.id FROM test_cases tc
      JOIN problems p ON tc.problem_id = p.id
      JOIN assignments a ON p.assignment_id = a.id
      WHERE tc.id = ? AND a.teacher_id = ?
    `, [testCaseId, teacherId]);

    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    await db.run(`
      UPDATE test_cases 
      SET 
        input = COALESCE(?, input),
        expected_output = COALESCE(?, expected_output),
        is_sample = COALESCE(?, is_sample),
        is_hidden = CASE WHEN ? IS NOT NULL THEN NOT ? ELSE is_hidden END,
        marks = COALESCE(?, marks)
      WHERE id = ?
    `, [input, expected_output, is_sample, is_sample, is_sample, marks, testCaseId]);

    const updated = await db.get(`
      SELECT * FROM test_cases WHERE id = ?
    `, [testCaseId]);

    res.json({ testCase: updated });
  } catch (error) {
    console.error('Error updating test case:', error);
    res.status(500).json({ error: 'Failed to update test case' });
  }
});

// Delete test case
router.delete('/test-cases/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const testCaseId = req.params.id;

    // Verify ownership
    const testCase = await db.get(`
      SELECT tc.id FROM test_cases tc
      JOIN problems p ON tc.problem_id = p.id
      JOIN assignments a ON p.assignment_id = a.id
      WHERE tc.id = ? AND a.teacher_id = ?
    `, [testCaseId, teacherId]);

    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    await db.run(`DELETE FROM test_cases WHERE id = ?`, [testCaseId]);

    res.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    console.error('Error deleting test case:', error);
    res.status(500).json({ error: 'Failed to delete test case' });
  }
});

// ==================== SUBMISSION REVIEW ====================

// Get submissions for assignment
router.get('/assignments/:id/submissions', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const assignmentId = req.params.id;

    // Verify ownership
    const assignment = await db.get(`
      SELECT id FROM assignments WHERE id = ? AND teacher_id = ?
    `, [assignmentId, teacherId]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const submissions = await db.all(`
      SELECT 
        s.*,
        u.name as student_name,
        u.usn,
        p.title as problem_title,
        p.marks as max_marks
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `, [assignmentId]);

    // Get submission count per student
    const submissionCounts = await db.all(`
      SELECT 
        student_id,
        u.name as student_name,
        u.usn,
        COUNT(*) as submission_count
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ?
      GROUP BY student_id
    `, [assignmentId]);

    res.json({ submissions, submissionCounts });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get students who submitted/not submitted
router.get('/assignments/:id/students', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const assignmentId = req.params.id;

    // Verify ownership
    const assignment = await db.get(`
      SELECT * FROM assignments WHERE id = ? AND teacher_id = ?
    `, [assignmentId, teacherId]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Get students who have submitted
    const submitted = await db.all(`
      SELECT DISTINCT
        u.id as student_id,
        u.name,
        u.usn,
        u.email,
        sa.status,
        sa.started_at,
        sa.submitted_at,
        sa.score,
        sa.violations,
        COUNT(DISTINCT s.id) as submission_count,
        MAX(s.submitted_at) as last_submission
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      LEFT JOIN student_assignments sa ON s.student_id = sa.student_id AND s.assignment_id = sa.assignment_id
      WHERE s.assignment_id = ?
      GROUP BY u.id
      ORDER BY last_submission DESC
    `, [assignmentId]);

    // Get all students (for "all" access type, or selected students for "selected" type)
    let notSubmitted = [];
    
    if (assignment.access_type === 'selected' && assignment.selected_students) {
      // Get specific students who haven't submitted
      const selectedUSNs = assignment.selected_students.split(',').map(s => s.trim());
      const submittedUSNs = submitted.map(s => s.usn);
      const pendingUSNs = selectedUSNs.filter(usn => !submittedUSNs.includes(usn));
      
      if (pendingUSNs.length > 0) {
        const placeholders = pendingUSNs.map(() => '?').join(',');
        notSubmitted = await db.all(`
          SELECT id as student_id, name, usn, email
          FROM users
          WHERE usn IN (${placeholders}) AND role = 'student'
        `, pendingUSNs);
      }
    } else {
      // For "all" access type, get all students who haven't submitted to this assignment
      const submittedIds = submitted.map(s => s.student_id);
      
      if (submittedIds.length > 0) {
        const placeholders = submittedIds.map(() => '?').join(',');
        notSubmitted = await db.all(`
          SELECT id as student_id, name, usn, email
          FROM users
          WHERE role = 'student' AND id NOT IN (${placeholders})
          ORDER BY usn ASC
          LIMIT 100
        `, submittedIds);
      } else {
        notSubmitted = await db.all(`
          SELECT id as student_id, name, usn, email
          FROM users
          WHERE role = 'student'
          ORDER BY usn ASC
          LIMIT 100
        `);
      }
    }

    res.json({ submitted, notSubmitted });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ==================== STUDENT PROFILES ====================

// Search students and get profile
router.get('/students/search', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { usn } = req.query;

    if (!usn) {
      return res.status(400).json({ error: 'USN is required' });
    }

    const student = await db.get(`
      SELECT id, usn, name, email, department, semester, created_at
      FROM users 
      WHERE usn = ? AND role = 'student'
    `, [usn]);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get assignment history
    const assignments = await db.all(`
      SELECT 
        sa.*,
        a.title as assignment_title,
        a.total_marks as max_marks,
        COUNT(DISTINCT s.id) as submission_count
      FROM student_assignments sa
      JOIN assignments a ON sa.assignment_id = a.id
      LEFT JOIN submissions s ON sa.student_id = s.student_id AND sa.assignment_id = s.assignment_id
      WHERE sa.student_id = ?
      GROUP BY sa.id
      ORDER BY sa.started_at DESC
    `, [student.id]);

    // Get problem stats
    const problemStats = await db.get(`
      SELECT 
        COUNT(DISTINCT problem_id) as problems_attempted,
        COUNT(DISTINCT CASE WHEN verdict = 'AC' THEN problem_id END) as problems_solved
      FROM submissions
      WHERE student_id = ?
    `, [student.id]);

    // Get average score
    const avgScore = await db.get(`
      SELECT AVG(score) as average_score
      FROM student_assignments
      WHERE student_id = ? AND status = 'completed'
    `, [student.id]);

    res.json({
      student,
      assignments,
      stats: {
        ...problemStats,
        averageScore: avgScore.average_score || 0
      }
    });
  } catch (error) {
    console.error('Error searching student:', error);
    res.status(500).json({ error: 'Failed to search student' });
  }
});

// ==================== CONTEST MANAGEMENT ====================

// Get all contests for teacher
router.get('/contests', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;

    const contests = await db.all(`
      SELECT 
        c.*,
        COUNT(DISTINCT cp.problem_id) as problem_count,
        COUNT(DISTINCT le.student_id) as participant_count
      FROM contests c
      LEFT JOIN contest_problems cp ON c.id = cp.contest_id
      LEFT JOIN leaderboard_entries le ON c.id = le.contest_id
      WHERE c.created_by = ?
      GROUP BY c.id
      ORDER BY c.start_time DESC
    `, [teacherId]);

    res.json({ contests });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

// Create contest
router.post('/contests', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const { title, description, start_time, end_time, duration_minutes, rules } = req.body;

    const result = await db.run(`
      INSERT INTO contests (title, description, start_time, end_time, duration_minutes, created_by, rules)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, start_time, end_time, duration_minutes, teacherId, rules]);

    const contest = await db.get(`
      SELECT * FROM contests WHERE id = ?
    `, [result.lastID]);

    res.status(201).json({ contest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ error: 'Failed to create contest' });
  }
});

// Update contest
router.put('/contests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const contestId = req.params.id;
    const { title, description, start_time, end_time, duration_minutes, status, rules } = req.body;

    // Verify ownership
    const contest = await db.get(`
      SELECT id FROM contests WHERE id = ? AND created_by = ?
    `, [contestId, teacherId]);

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    await db.run(`
      UPDATE contests 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        duration_minutes = COALESCE(?, duration_minutes),
        status = COALESCE(?, status),
        rules = COALESCE(?, rules)
      WHERE id = ?
    `, [title, description, start_time, end_time, duration_minutes, status, rules, contestId]);

    const updated = await db.get(`
      SELECT * FROM contests WHERE id = ?
    `, [contestId]);

    res.json({ contest: updated });
  } catch (error) {
    console.error('Error updating contest:', error);
    res.status(500).json({ error: 'Failed to update contest' });
  }
});

// Get contest leaderboard
router.get('/contests/:id/leaderboard', auth, teacherOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teacherId = req.user.id;
    const contestId = req.params.id;

    // Verify ownership
    const contest = await db.get(`
      SELECT id FROM contests WHERE id = ? AND created_by = ?
    `, [contestId, teacherId]);

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const leaderboard = await db.all(`
      SELECT 
        le.*,
        u.name as student_name,
        u.usn
      FROM leaderboard_entries le
      JOIN users u ON le.student_id = u.id
      WHERE le.contest_id = ?
      ORDER BY le.rank ASC, le.score DESC, le.penalty ASC
    `, [contestId]);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
