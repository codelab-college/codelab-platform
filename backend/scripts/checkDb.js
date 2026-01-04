import Database from '../database/Database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/codelab.db');
const db = new Database(dbPath);

async function check() {
  try {
    // Check tables
    const tables = await db.all(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log('Tables:', tables.map(t => t.name));
    
    // Check all problems
    const problems = await db.all(`SELECT id, title, assignment_id, is_practice FROM problems`);
    console.log('\nAll problems:');
    problems.forEach(p => {
      console.log(`  ID ${p.id}: "${p.title}" (assignment_id: ${p.assignment_id}, is_practice: ${p.is_practice})`);
    });
    
    // Check test_cases if exists
    if (tables.find(t => t.name === 'test_cases')) {
      const testCases = await db.all(`SELECT * FROM test_cases LIMIT 3`);
      console.log('\nSample test cases:');
      testCases.forEach(tc => {
        console.log(`  Problem ${tc.problem_id}: Input: "${tc.input.substring(0,30)}..." Expected: "${tc.expected_output}"`);
      });
    } else {
      console.log('\ntest_cases table DOES NOT EXIST!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit();
}

check();
