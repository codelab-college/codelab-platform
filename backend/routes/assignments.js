import express from 'express';
import { auth, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all assignments for student
router.get('/', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const studentId = req.user.id;
    const studentUSN = req.user.usn;

    const assignments = await db.all(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.is_timed,
        a.duration_minutes,
        a.total_marks,
        a.status,
        a.access_type,
        a.selected_students,
        u.name as teacher_name,
        COUNT(DISTINCT p.id) as problem_count,
        COALESCE(sa.status, 'not_started') as student_status,
        sa.score,
        sa.started_at,
        sa.submitted_at
      FROM assignments a
      LEFT JOIN users u ON a.teacher_id = u.id
      LEFT JOIN problems p ON a.id = p.assignment_id
      LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ?
      WHERE a.status = 'active' AND a.is_hidden = 0
        AND (
          a.access_type = 'all' 
          OR (a.access_type = 'selected' AND (',' || a.selected_students || ',') LIKE ('%,' || ? || ',%'))
        )
      GROUP BY a.id
      ORDER BY a.due_date ASC
    `, [studentId, studentUSN]);

    res.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get assignment details
router.get('/:id', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const assignmentId = req.params.id;
    const studentId = req.user.id;

    const assignment = await db.get(`
      SELECT 
        a.*,
        u.name as teacher_name,
        COALESCE(sa.status, 'not_started') as student_status,
        sa.score,
        sa.started_at,
        sa.submitted_at
      FROM assignments a
      LEFT JOIN users u ON a.teacher_id = u.id
      LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ?
      WHERE a.id = ?
    `, [studentId, assignmentId]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const problems = await db.all(`
      SELECT 
        p.id,
        p.title,
        p.difficulty,
        p.marks,
        p.order_index,
        (
          SELECT COUNT(*) 
          FROM submissions s 
          WHERE s.problem_id = p.id 
            AND s.student_id = ?
            AND s.verdict = 'AC'
          LIMIT 1
        ) as is_solved
      FROM problems p
      WHERE p.assignment_id = ?
      ORDER BY p.order_index ASC
    `, [studentId, assignmentId]);

    res.json({ 
      assignment,
      problems 
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Start assignment
router.post('/:id/start', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const assignmentId = req.params.id;
    const studentId = req.user.id;

    // Check if assignment exists
    const assignment = await db.get(
      'SELECT * FROM assignments WHERE id = ?',
      [assignmentId]
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if already started
    const existing = await db.get(
      'SELECT * FROM student_assignments WHERE student_id = ? AND assignment_id = ?',
      [studentId, assignmentId]
    );

    if (existing) {
      return res.json({ 
        message: 'Assignment already started',
        studentAssignment: existing 
      });
    }

    // Create student assignment record
    await db.run(
      `INSERT INTO student_assignments (student_id, assignment_id, status, started_at) 
       VALUES (?, ?, 'in_progress', datetime('now'))`,
      [studentId, assignmentId]
    );

    res.json({ message: 'Assignment started successfully' });
  } catch (error) {
    console.error('Error starting assignment:', error);
    res.status(500).json({ error: 'Failed to start assignment' });
  }
});

export default router;
