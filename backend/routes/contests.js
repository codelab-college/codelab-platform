import express from 'express';
import { auth, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all contests
router.get('/', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');

    const contests = await db.all(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.start_time,
        c.end_time,
        c.duration_minutes,
        c.status,
        u.name as created_by_name,
        COUNT(DISTINCT cp.problem_id) as problem_count
      FROM contests c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN contest_problems cp ON c.id = cp.contest_id
      GROUP BY c.id
      ORDER BY c.start_time DESC
    `);

    res.json({ contests });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

// Get contest details
router.get('/:id', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const contestId = req.params.id;

    const contest = await db.get(`
      SELECT 
        c.*,
        u.name as created_by_name
      FROM contests c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [contestId]);

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const problems = await db.all(`
      SELECT 
        p.id,
        p.title,
        p.difficulty,
        p.marks,
        cp.order_index
      FROM contest_problems cp
      JOIN problems p ON cp.problem_id = p.id
      WHERE cp.contest_id = ?
      ORDER BY cp.order_index ASC
    `, [contestId]);

    res.json({ contest, problems });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ error: 'Failed to fetch contest' });
  }
});

// Get contest leaderboard
router.get('/:id/leaderboard', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const contestId = req.params.id;

    const leaderboard = await db.all(`
      SELECT 
        l.rank,
        l.score,
        l.penalty,
        l.problems_solved,
        l.last_submission,
        u.name as student_name,
        u.usn
      FROM leaderboard_entries l
      JOIN users u ON l.student_id = u.id
      WHERE l.contest_id = ?
      ORDER BY l.rank ASC
    `, [contestId]);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
