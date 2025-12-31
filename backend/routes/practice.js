import express from 'express';
import { auth, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// ==================== PRACTICE PROBLEMS ====================

// Get all practice problems (no assignment, no deadline)
router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;
    const { difficulty, tag, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.is_practice = 1';
    let params = [];

    if (difficulty) {
      whereClause += ' AND p.difficulty = ?';
      params.push(difficulty);
    }

    if (tag) {
      whereClause += ' AND p.tags LIKE ?';
      params.push(`%${tag}%`);
    }

    const problems = await db.all(`
      SELECT 
        p.id, p.title, p.difficulty, p.tags, p.marks,
        (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id AND verdict = 'AC') as total_solved,
        (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id AND student_id = ? AND verdict = 'AC') > 0 as is_solved,
        (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id AND student_id = ?) as attempt_count
      FROM problems p
      ${whereClause}
      ORDER BY p.difficulty, p.id
      LIMIT ? OFFSET ?
    `, [userId, userId, ...params, limit, offset]);

    const total = await db.get(`SELECT COUNT(*) as count FROM problems p ${whereClause}`, params);

    // Get unique tags
    const tags = await db.all(`
      SELECT DISTINCT tags FROM problems WHERE is_practice = 1 AND tags IS NOT NULL
    `);
    const allTags = [...new Set(tags.flatMap(t => t.tags ? t.tags.split(',').map(s => s.trim()) : []))];

    res.json({
      problems,
      tags: allTags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Practice problems error:', error);
    res.status(500).json({ message: 'Failed to fetch practice problems' });
  }
});

// Get practice problem detail
router.get('/:id', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const userId = req.user.id;

    const problem = await db.get(`
      SELECT p.*,
        (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id AND verdict = 'AC') as total_solved,
        (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id) as total_attempts
      FROM problems p
      WHERE p.id = ? AND p.is_practice = 1
    `, [id]);

    if (!problem) {
      return res.status(404).json({ message: 'Practice problem not found' });
    }

    // Get sample test cases only
    const testCases = await db.all(`
      SELECT id, input, expected_output, is_sample
      FROM test_cases
      WHERE problem_id = ? AND is_sample = 1
    `, [id]);

    // Get user's saved code
    const savedCode = await db.get(`
      SELECT code, language FROM saved_code
      WHERE user_id = ? AND problem_id = ?
    `, [userId, id]);

    // Get user's submission history
    const submissions = await db.all(`
      SELECT id, verdict, score, language, submitted_at, execution_time
      FROM submissions
      WHERE student_id = ? AND problem_id = ?
      ORDER BY submitted_at DESC
      LIMIT 10
    `, [userId, id]);

    res.json({
      problem,
      testCases,
      savedCode,
      submissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch problem' });
  }
});

// Run code for practice (no submission saved)
router.post('/:id/run', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const { code, language } = req.body;

    const problem = await db.get('SELECT * FROM problems WHERE id = ? AND is_practice = 1', [id]);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get sample test cases
    const testCases = await db.all(`
      SELECT * FROM test_cases WHERE problem_id = ? AND is_sample = 1
    `, [id]);

    const codeExecutor = req.app.get('codeExecutor');
    const results = [];

    for (const testCase of testCases) {
      const result = await codeExecutor.execute(code, language, testCase.input);
      const passed = result.output?.trim() === testCase.expected_output?.trim();
      
      results.push({
        testCaseId: testCase.id,
        input: testCase.input,
        expectedOutput: testCase.expected_output,
        actualOutput: result.output,
        passed,
        executionTime: result.executionTime,
        error: result.error
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Practice run error:', error);
    res.status(500).json({ message: 'Failed to run code' });
  }
});

// Submit practice solution
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const userId = req.user.id;
    const { code, language } = req.body;

    const problem = await db.get('SELECT * FROM problems WHERE id = ? AND is_practice = 1', [id]);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get ALL test cases
    const testCases = await db.all('SELECT * FROM test_cases WHERE problem_id = ?', [id]);
    const codeExecutor = req.app.get('codeExecutor');

    let passedCount = 0;
    let totalTime = 0;
    const results = [];

    for (const testCase of testCases) {
      const result = await codeExecutor.execute(code, language, testCase.input);
      const passed = result.output?.trim() === testCase.expected_output?.trim();
      
      if (passed) passedCount++;
      totalTime += result.executionTime || 0;

      results.push({
        testCaseId: testCase.id,
        passed,
        isSample: testCase.is_sample,
        executionTime: result.executionTime
      });
    }

    // Calculate verdict and score
    const allPassed = passedCount === testCases.length;
    const verdict = allPassed ? 'AC' : 'WA';
    const score = Math.round((passedCount / testCases.length) * problem.marks);

    // Save submission (use 0 as assignment_id for practice problems since column is NOT NULL)
    const submission = await db.run(`
      INSERT INTO submissions (student_id, problem_id, assignment_id, code, language, verdict, score, execution_time, test_cases_passed, total_test_cases, submitted_at)
      VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [userId, id, code, language, verdict, score, totalTime, passedCount, testCases.length]);

    // Check for badge achievements
    await checkBadges(db, userId);

    res.json({
      submissionId: submission.lastID,
      verdict,
      score,
      maxScore: problem.marks,
      passedCount,
      totalTests: testCases.length,
      executionTime: totalTime,
      results: results.filter(r => r.isSample) // Only show sample results
    });
  } catch (error) {
    console.error('Practice submit error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Failed to submit', error: error.message });
  }
});

// Save code for practice problem
router.post('/:id/save', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const userId = req.user.id;
    const { code, language } = req.body;

    // Check if problem exists
    const problem = await db.get('SELECT id FROM problems WHERE id = ? AND is_practice = 1', [id]);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Upsert saved code
    await db.run(`
      INSERT INTO saved_code (user_id, problem_id, code, language, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, problem_id) DO UPDATE SET
        code = excluded.code,
        language = excluded.language,
        updated_at = datetime('now')
    `, [userId, id, code, language]);

    res.json({ message: 'Code saved successfully' });
  } catch (error) {
    console.error('Save code error:', error);
    res.status(500).json({ message: 'Failed to save code' });
  }
});

// Get practice stats for user
router.get('/stats/me', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.problem_id END) as solved,
        COUNT(DISTINCT s.problem_id) as attempted,
        COUNT(*) as total_submissions
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.student_id = ? AND p.is_practice = 1
    `, [userId]);

    const byDifficulty = await db.all(`
      SELECT 
        p.difficulty,
        COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.problem_id END) as solved,
        (SELECT COUNT(*) FROM problems WHERE is_practice = 1 AND difficulty = p.difficulty) as total
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.student_id = ? AND p.is_practice = 1
      GROUP BY p.difficulty
    `, [userId]);

    res.json({ stats, byDifficulty });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stats' });
  }
});

// Helper function to check and award badges
async function checkBadges(db, userId) {
  try {
    // Get user stats
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT CASE WHEN verdict = 'AC' THEN problem_id END) as solved,
        COUNT(*) as total_submissions
      FROM submissions
      WHERE student_id = ?
    `, [userId]);

    // Check badge conditions
    const badges = await db.all('SELECT * FROM badges');
    
    for (const badge of badges) {
      const condition = JSON.parse(badge.condition || '{}');
      let earned = false;

      if (condition.type === 'problems_solved' && stats.solved >= condition.count) {
        earned = true;
      } else if (condition.type === 'submissions' && stats.total_submissions >= condition.count) {
        earned = true;
      }

      if (earned) {
        // Check if already has badge
        const existing = await db.get(
          'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
          [userId, badge.id]
        );

        if (!existing) {
          await db.run(
            'INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, datetime("now"))',
            [userId, badge.id]
          );
        }
      }
    }
  } catch (error) {
    console.error('Badge check error:', error);
  }
}

export default router;
