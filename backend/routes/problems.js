import express from 'express';
import { auth, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// Get problem details
router.get('/:id', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const problemId = req.params.id;
    const studentId = req.user.id;

    const problem = await db.get(`
      SELECT 
        p.*,
        a.title as assignment_title,
        a.id as assignment_id
      FROM problems p
      JOIN assignments a ON p.assignment_id = a.id
      WHERE p.id = ?
    `, [problemId]);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Get sample test cases (visible)
    const sampleTests = await db.all(`
      SELECT input, expected_output
      FROM test_cases
      WHERE problem_id = ? AND is_sample = 1
      ORDER BY id ASC
    `, [problemId]);

    // Get student's submissions for this problem
    const submissions = await db.all(`
      SELECT 
        id,
        language,
        verdict,
        score,
        execution_time,
        test_cases_passed,
        total_test_cases,
        is_final,
        submitted_at
      FROM submissions
      WHERE student_id = ? AND problem_id = ?
      ORDER BY submitted_at DESC
    `, [studentId, problemId]);

    res.json({
      problem,
      sampleTests,
      submissions
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// Get student's saved code for a problem
router.get('/:id/code', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const problemId = req.params.id;
    const studentId = req.user.id;

    // Get most recent submission
    const submission = await db.get(`
      SELECT code, language
      FROM submissions
      WHERE student_id = ? AND problem_id = ?
      ORDER BY submitted_at DESC
      LIMIT 1
    `, [studentId, problemId]);

    res.json({ 
      code: submission?.code || '',
      language: submission?.language || 'python'
    });
  } catch (error) {
    console.error('Error fetching code:', error);
    res.status(500).json({ error: 'Failed to fetch code' });
  }
});

export default router;
