import express from 'express';
import { auth, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// Get student dashboard data
router.get('/', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const studentId = req.user.id;

    // Active assignments
    const activeAssignments = await db.all(`
      SELECT 
        a.id,
        a.title,
        a.due_date,
        a.total_marks,
        COALESCE(sa.status, 'not_started') as status,
        sa.score,
        u.name as teacher_name,
        COUNT(DISTINCT p.id) as problem_count
      FROM assignments a
      LEFT JOIN users u ON a.teacher_id = u.id
      LEFT JOIN problems p ON a.id = p.assignment_id
      LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ?
      WHERE a.status = 'active' AND datetime(a.due_date) > datetime('now')
      GROUP BY a.id
      ORDER BY a.due_date ASC
      LIMIT 5
    `, [studentId]);

    // Upcoming contests
    const upcomingContests = await db.all(`
      SELECT 
        c.id,
        c.title,
        c.start_time,
        c.end_time,
        c.duration_minutes,
        c.status,
        COUNT(DISTINCT cp.problem_id) as problem_count
      FROM contests c
      LEFT JOIN contest_problems cp ON c.id = cp.contest_id
      WHERE c.status IN ('upcoming', 'active')
      GROUP BY c.id
      ORDER BY c.start_time ASC
      LIMIT 5
    `, []);

    // Recent submissions (include practice submissions with assignment_id = 0)
    const recentSubmissions = await db.all(`
      SELECT 
        s.id,
        s.verdict,
        s.score,
        s.submitted_at,
        p.title as problem_title,
        CASE 
          WHEN s.assignment_id = 0 THEN 'Practice'
          ELSE COALESCE(a.title, 'Unknown')
        END as assignment_title
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      LEFT JOIN assignments a ON s.assignment_id = a.id AND s.assignment_id != 0
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT 10
    `, [studentId]);

    // Progress stats
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.problem_id END) as problems_solved,
        COUNT(DISTINCT s.assignment_id) as assignments_attempted,
        COUNT(s.id) as total_submissions,
        COALESCE(AVG(CASE WHEN sa.submitted_at IS NOT NULL THEN sa.score END), 0) as avg_score
      FROM submissions s
      LEFT JOIN student_assignments sa ON s.student_id = sa.student_id AND s.assignment_id = sa.assignment_id
      WHERE s.student_id = ?
    `, [studentId]);

    res.json({
      activeAssignments,
      upcomingContests,
      recentSubmissions,
      stats: {
        problemsSolved: stats.problems_solved || 0,
        assignmentsAttempted: stats.assignments_attempted || 0,
        totalSubmissions: stats.total_submissions || 0,
        avgScore: Math.round(stats.avg_score) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
