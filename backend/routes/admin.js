import express from 'express';
import bcrypt from 'bcryptjs';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ==================== ADMIN DASHBOARD ====================

// Get admin dashboard stats
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');

    // Get total counts
    const [teachers, students, assignments, submissions, problems] = await Promise.all([
      db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`),
      db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`),
      db.get(`SELECT COUNT(*) as count FROM assignments`),
      db.get(`SELECT COUNT(*) as count FROM submissions`),
      db.get(`SELECT COUNT(*) as count FROM problems`)
    ]);

    // Get recent activity
    const recentSubmissions = await db.all(`
      SELECT s.id, s.verdict, s.score, s.submitted_at,
             u.name as student_name, u.usn,
             p.title as problem_title
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN problems p ON s.problem_id = p.id
      ORDER BY s.submitted_at DESC
      LIMIT 10
    `);

    // Get submissions per day (last 7 days)
    const submissionTrend = await db.all(`
      SELECT DATE(submitted_at) as date, COUNT(*) as count
      FROM submissions
      WHERE submitted_at >= datetime('now', '-7 days')
      GROUP BY DATE(submitted_at)
      ORDER BY date
    `);

    // Get verdict distribution
    const verdictStats = await db.all(`
      SELECT verdict, COUNT(*) as count
      FROM submissions
      GROUP BY verdict
    `);

    res.json({
      stats: {
        teachers: teachers.count,
        students: students.count,
        assignments: assignments.count,
        submissions: submissions.count,
        problems: problems.count
      },
      recentSubmissions,
      submissionTrend,
      verdictStats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// ==================== TEACHER MANAGEMENT ====================

// Get all teachers
router.get('/teachers', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const teachers = await db.all(`
      SELECT id, name, email, usn, department, created_at,
             (SELECT COUNT(*) FROM assignments WHERE teacher_id = users.id) as assignment_count
      FROM users
      WHERE role = 'teacher'
      ORDER BY created_at DESC
    `);
    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Create teacher
router.post('/teachers', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { name, email, usn, password, department } = req.body;

    // Check if email/usn exists
    const existing = await db.get(
      'SELECT id FROM users WHERE email = ? OR usn = ?',
      [email, usn]
    );
    if (existing) {
      return res.status(400).json({ message: 'Email or USN already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(`
      INSERT INTO users (name, email, usn, password, role, department)
      VALUES (?, ?, ?, ?, 'teacher', ?)
    `, [name, email, usn, hashedPassword, department]);

    res.status(201).json({ message: 'Teacher created', id: result.lastID });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ message: 'Failed to create teacher' });
  }
});

// Update teacher
router.put('/teachers/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const { name, email, department, password } = req.body;

    let query = 'UPDATE users SET name = ?, email = ?, department = ?';
    let params = [name, email, department];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ? AND role = ?';
    params.push(id, 'teacher');

    await db.run(query, params);
    res.json({ message: 'Teacher updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update teacher' });
  }
});

// Delete teacher
router.delete('/teachers/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    await db.run('DELETE FROM users WHERE id = ? AND role = ?', [id, 'teacher']);
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

// ==================== STUDENT MANAGEMENT ====================

// Get all students with pagination
router.get('/students', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE role = 'student'";
    let params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR usn LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const students = await db.all(`
      SELECT u.id, u.name, u.email, u.usn, u.department, u.section, u.created_at,
             (SELECT COUNT(*) FROM submissions WHERE student_id = u.id) as submission_count,
             (SELECT COUNT(*) FROM submissions WHERE student_id = u.id AND verdict = 'AC') as solved_count,
             (SELECT SUM(score) FROM submissions WHERE student_id = u.id) as total_score
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const total = await db.get(`SELECT COUNT(*) as count FROM users ${whereClause}`, params);

    res.json({ 
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Create student
router.post('/students', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { name, email, usn, password, department, section } = req.body;

    const existing = await db.get(
      'SELECT id FROM users WHERE email = ? OR usn = ?',
      [email, usn]
    );
    if (existing) {
      return res.status(400).json({ message: 'Email or USN already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(`
      INSERT INTO users (name, email, usn, password, role, department, section)
      VALUES (?, ?, ?, ?, 'student', ?, ?)
    `, [name, email, usn, hashedPassword, department, section]);

    res.status(201).json({ message: 'Student created', id: result.lastID });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student' });
  }
});

// Batch import students (CSV)
router.post('/students/batch', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { students } = req.body; // Array of student objects

    const results = { success: 0, failed: 0, errors: [] };
    const defaultPassword = await bcrypt.hash('password123', 10);

    for (const student of students) {
      try {
        const existing = await db.get(
          'SELECT id FROM users WHERE usn = ?',
          [student.usn]
        );
        if (existing) {
          results.failed++;
          results.errors.push({ usn: student.usn, error: 'USN already exists' });
          continue;
        }

        await db.run(`
          INSERT INTO users (name, email, usn, password, role, department, section)
          VALUES (?, ?, ?, ?, 'student', ?, ?)
        `, [
          student.name,
          student.email || `${student.usn.toLowerCase()}@college.edu`,
          student.usn,
          defaultPassword,
          student.department || 'CSE',
          student.section || 'A'
        ]);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ usn: student.usn, error: err.message });
      }
    }

    res.json({ 
      message: `Imported ${results.success} students, ${results.failed} failed`,
      ...results
    });
  } catch (error) {
    res.status(500).json({ message: 'Batch import failed' });
  }
});

// Update student
router.put('/students/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const { name, email, department, section, password } = req.body;

    let query = 'UPDATE users SET name = ?, email = ?, department = ?, section = ?';
    let params = [name, email, department, section];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ? AND role = ?';
    params.push(id, 'student');

    await db.run(query, params);
    res.json({ message: 'Student updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete student
router.delete('/students/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    await db.run('DELETE FROM users WHERE id = ? AND role = ?', [id, 'student']);
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// ==================== PLAGIARISM DETECTION ====================

// Check plagiarism for an assignment
router.get('/plagiarism/:assignmentId', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { assignmentId } = req.params;
    const { problemId } = req.query;

    let query = `
      SELECT s.id, s.code, s.language, s.student_id, s.problem_id,
             u.name as student_name, u.usn,
             p.title as problem_title
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE s.assignment_id = ? AND s.verdict = 'AC'
    `;
    let params = [assignmentId];

    if (problemId) {
      query += ' AND s.problem_id = ?';
      params.push(problemId);
    }

    query += ' ORDER BY s.problem_id, s.submitted_at';

    const submissions = await db.all(query, params);

    // Group by problem
    const problemGroups = {};
    submissions.forEach(s => {
      if (!problemGroups[s.problem_id]) {
        problemGroups[s.problem_id] = {
          problemTitle: s.problem_title,
          submissions: []
        };
      }
      problemGroups[s.problem_id].submissions.push(s);
    });

    // Calculate similarity for each problem
    const results = [];
    for (const [problemId, group] of Object.entries(problemGroups)) {
      const similarities = [];
      const subs = group.submissions;

      for (let i = 0; i < subs.length; i++) {
        for (let j = i + 1; j < subs.length; j++) {
          const similarity = calculateSimilarity(subs[i].code, subs[j].code);
          if (similarity >= 0.7) { // 70% threshold
            similarities.push({
              student1: { id: subs[i].student_id, name: subs[i].student_name, usn: subs[i].usn },
              student2: { id: subs[j].student_id, name: subs[j].student_name, usn: subs[j].usn },
              similarity: Math.round(similarity * 100),
              submissionId1: subs[i].id,
              submissionId2: subs[j].id
            });
          }
        }
      }

      if (similarities.length > 0) {
        results.push({
          problemId,
          problemTitle: group.problemTitle,
          matches: similarities.sort((a, b) => b.similarity - a.similarity)
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({ message: 'Plagiarism check failed' });
  }
});

// Compare two specific submissions
router.get('/plagiarism/compare/:id1/:id2', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id1, id2 } = req.params;

    const [sub1, sub2] = await Promise.all([
      db.get(`
        SELECT s.*, u.name as student_name, u.usn, p.title as problem_title
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        JOIN problems p ON s.problem_id = p.id
        WHERE s.id = ?
      `, [id1]),
      db.get(`
        SELECT s.*, u.name as student_name, u.usn, p.title as problem_title
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        JOIN problems p ON s.problem_id = p.id
        WHERE s.id = ?
      `, [id2])
    ]);

    if (!sub1 || !sub2) {
      return res.status(404).json({ message: 'Submissions not found' });
    }

    const similarity = calculateSimilarity(sub1.code, sub2.code);
    const diff = generateDiff(sub1.code, sub2.code);

    res.json({
      submission1: sub1,
      submission2: sub2,
      similarity: Math.round(similarity * 100),
      diff
    });
  } catch (error) {
    res.status(500).json({ message: 'Comparison failed' });
  }
});

// Token-based similarity calculation
function calculateSimilarity(code1, code2) {
  const tokens1 = tokenize(code1);
  const tokens2 = tokenize(code2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  // Jaccard similarity
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

function tokenize(code) {
  // Remove comments and whitespace, extract meaningful tokens
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\/\/.*/g, '') // Remove single-line comments
    .replace(/#.*/g, '') // Remove Python comments
    .replace(/['"`][^'"`]*['"`]/g, 'STR') // Replace strings with placeholder
    .replace(/\d+/g, 'NUM') // Replace numbers with placeholder
    .split(/\s+/)
    .filter(t => t.length > 0);
}

function generateDiff(code1, code2) {
  const lines1 = code1.split('\n');
  const lines2 = code2.split('\n');
  
  return {
    lines1: lines1.length,
    lines2: lines2.length,
    code1: code1,
    code2: code2
  };
}

// ==================== REPORT GENERATION ====================

// Get assignment report
router.get('/reports/assignment/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;

    const assignment = await db.get('SELECT * FROM assignments WHERE id = ?', [id]);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Get all problems
    const problems = await db.all('SELECT * FROM problems WHERE assignment_id = ?', [id]);

    // Get all submissions with student info
    const submissions = await db.all(`
      SELECT s.*, u.name as student_name, u.usn, u.section,
             p.title as problem_title, p.marks as max_marks
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE s.assignment_id = ?
      ORDER BY u.usn, p.id
    `, [id]);

    // Get unique students who attempted
    const studentStats = await db.all(`
      SELECT 
        u.id, u.name, u.usn, u.section,
        COUNT(DISTINCT s.problem_id) as problems_attempted,
        COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.problem_id END) as problems_solved,
        COALESCE(SUM(CASE WHEN s.id IN (
          SELECT id FROM submissions sub 
          WHERE sub.student_id = u.id AND sub.assignment_id = ?
          GROUP BY sub.problem_id 
          HAVING MAX(sub.score)
        ) THEN s.score ELSE 0 END), 0) as total_score
      FROM users u
      LEFT JOIN submissions s ON u.id = s.student_id AND s.assignment_id = ?
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY total_score DESC, u.usn
    `, [id, id]);

    // Calculate stats
    const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0);
    const avgScore = studentStats.length > 0 
      ? studentStats.reduce((sum, s) => sum + (s.total_score || 0), 0) / studentStats.length 
      : 0;

    res.json({
      assignment,
      problems,
      studentStats,
      summary: {
        totalProblems: problems.length,
        totalMarks,
        totalStudents: studentStats.length,
        averageScore: Math.round(avgScore * 100) / 100,
        submissionCount: submissions.length
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Get student performance report
router.get('/reports/student/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;

    const student = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'student']);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all submissions
    const submissions = await db.all(`
      SELECT s.*, p.title as problem_title, p.difficulty, a.title as assignment_title
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `, [id]);

    // Get assignment-wise performance
    const assignmentPerformance = await db.all(`
      SELECT 
        a.id, a.title,
        COUNT(DISTINCT s.problem_id) as problems_attempted,
        COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.problem_id END) as problems_solved,
        MAX(s.score) as best_score
      FROM assignments a
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `, [id]);

    // Get badges
    const badges = await db.all(`
      SELECT b.*, ub.earned_at
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `, [id]);

    res.json({
      student,
      submissions,
      assignmentPerformance,
      badges,
      stats: {
        totalSubmissions: submissions.length,
        acceptedCount: submissions.filter(s => s.verdict === 'AC').length,
        uniqueProblemsSolved: new Set(submissions.filter(s => s.verdict === 'AC').map(s => s.problem_id)).size
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// ==================== GLOBAL SETTINGS ====================

// Get settings
router.get('/settings', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const settings = await db.all('SELECT * FROM settings');
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json({ settings: settingsObj });
  } catch (error) {
    res.json({ settings: {} });
  }
});

// Update settings
router.put('/settings', auth, adminOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await db.run(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = ?
      `, [key, value, value]);
    }

    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;
