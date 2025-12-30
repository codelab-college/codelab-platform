import express from 'express';
import { auth, studentOnly } from '../middleware/auth.js';
import { executeCode } from '../services/codeExecutor.js';

const router = express.Router();

// Run code (visible tests only)
router.post('/run', auth, studentOnly, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const db = req.app.get('db');

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Get sample test cases
    const testCases = await db.all(`
      SELECT input, expected_output
      FROM test_cases
      WHERE problem_id = ? AND is_sample = 1
    `, [problemId]);

    if (testCases.length === 0) {
      return res.status(404).json({ error: 'No sample test cases found' });
    }

    // Execute code against sample tests
    const results = [];
    for (const testCase of testCases) {
      const result = await executeCode(code, language, testCase.input);
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expected_output,
        actualOutput: result.output,
        passed: result.output.trim() === testCase.expected_output.trim(),
        executionTime: result.executionTime,
        error: result.error
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: 'Failed to run code' });
  }
});

// Submit code (final submission)
router.post('/submit', auth, studentOnly, async (req, res) => {
  try {
    const { problemId, assignmentId, code, language, isFinal } = req.body;
    const studentId = req.user.id;
    const db = req.app.get('db');

    if (!code || !language || !problemId || !assignmentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get all test cases (including hidden)
    const testCases = await db.all(`
      SELECT id, input, expected_output, marks
      FROM test_cases
      WHERE problem_id = ?
    `, [problemId]);

    if (testCases.length === 0) {
      return res.status(404).json({ error: 'No test cases found' });
    }

    // Execute code against all test cases
    let totalScore = 0;
    let passedTests = 0;
    let verdict = 'AC'; // Accepted
    let errorMessage = null;
    let maxExecutionTime = 0;

    for (const testCase of testCases) {
      const result = await executeCode(code, language, testCase.input);
      
      if (result.error) {
        verdict = 'RE'; // Runtime Error
        errorMessage = result.error;
        break;
      }

      if (result.timeout) {
        verdict = 'TLE'; // Time Limit Exceeded
        break;
      }

      maxExecutionTime = Math.max(maxExecutionTime, result.executionTime);

      if (result.output.trim() === testCase.expected_output.trim()) {
        totalScore += testCase.marks;
        passedTests++;
      } else {
        if (verdict === 'AC') {
          verdict = 'WA'; // Wrong Answer
        }
      }
    }

    // Save submission
    const submissionResult = await db.run(`
      INSERT INTO submissions (
        student_id, problem_id, assignment_id, code, language,
        verdict, score, execution_time, test_cases_passed, total_test_cases,
        error_message, is_final
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, problemId, assignmentId, code, language,
      verdict, totalScore, maxExecutionTime, passedTests, testCases.length,
      errorMessage, isFinal ? 1 : 0
    ]);

    // Update student assignment score if this is final submission
    if (isFinal) {
      await db.run(`
        UPDATE student_assignments
        SET submitted_at = datetime('now')
        WHERE student_id = ? AND assignment_id = ?
      `, [studentId, assignmentId]);
    }

    res.json({
      submissionId: submissionResult.lastID,
      verdict,
      score: totalScore,
      executionTime: maxExecutionTime,
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
      errorMessage
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

// Get submission history
router.get('/history/:problemId', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const problemId = req.params.problemId;
    const studentId = req.user.id;

    const submissions = await db.all(`
      SELECT 
        id,
        code,
        language,
        verdict,
        score,
        execution_time,
        test_cases_passed,
        total_test_cases,
        error_message,
        is_final,
        submitted_at
      FROM submissions
      WHERE student_id = ? AND problem_id = ?
      ORDER BY submitted_at DESC
    `, [studentId, problemId]);

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get submission details
router.get('/:id', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const submissionId = req.params.id;
    const studentId = req.user.id;

    const submission = await db.get(`
      SELECT 
        s.*,
        p.title as problem_title,
        a.title as assignment_title
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.id = ? AND s.student_id = ?
    `, [submissionId, studentId]);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

export default router;
