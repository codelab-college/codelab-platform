import Database from '../database/Database.js';

const db = new Database('./database/codelab.db');

async function test() {
  try {
    console.log('Testing submissions insert...');
    
    const result = await db.run(`
      INSERT INTO submissions (student_id, problem_id, assignment_id, code, language, verdict, score, execution_time, test_cases_passed, total_test_cases, submitted_at)
      VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [1, 1, 'print("hello")', 'python', 'WA', 10, 100, 1, 2]);
    
    console.log('Insert successful!', result);
    
    const rows = await db.all('SELECT id, verdict, score FROM submissions ORDER BY id DESC LIMIT 3');
    console.log('Recent submissions:', rows);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
