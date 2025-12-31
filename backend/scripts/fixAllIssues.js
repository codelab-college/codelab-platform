// Comprehensive fix script for all database and schema issues
import sqlite3Pkg from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3Pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/codelab.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Promisify db methods
const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

async function fix() {
  try {
    console.log('\n🔧 Starting comprehensive fix...\n');

    // ==================== 1. ADD MISSING TEST CASES FOR ASSIGNMENT PROBLEMS ====================
    console.log('📦 Adding test cases for assignment problems...');
    
    const assignmentProblems = [
      {
        id: 1,
        title: 'Two Sum',
        testCases: [
          { input: '4\n2 7 11 15\n9', output: '0 1', isSample: 1, marks: 25 },
          { input: '3\n3 2 4\n6', output: '1 2', isSample: 1, marks: 25 },
          { input: '2\n3 3\n6', output: '0 1', isSample: 0, marks: 25 },
          { input: '5\n1 5 3 7 2\n8', output: '1 2', isSample: 0, marks: 25 }
        ]
      },
      {
        id: 2,
        title: 'Valid Palindrome',
        testCases: [
          { input: 'A man a plan a canal Panama', output: 'true', isSample: 1, marks: 25 },
          { input: 'race a car', output: 'false', isSample: 1, marks: 25 },
          { input: 'Was it a car or a cat I saw', output: 'true', isSample: 0, marks: 25 },
          { input: 'hello world', output: 'false', isSample: 0, marks: 25 }
        ]
      },
      {
        id: 3,
        title: 'Binary Search',
        testCases: [
          { input: '6\n-1 0 3 5 9 12\n9', output: '4', isSample: 1, marks: 25 },
          { input: '6\n-1 0 3 5 9 12\n2', output: '-1', isSample: 1, marks: 25 },
          { input: '5\n1 2 3 4 5\n3', output: '2', isSample: 0, marks: 25 },
          { input: '3\n1 3 5\n6', output: '-1', isSample: 0, marks: 25 }
        ]
      },
      {
        id: 4,
        title: 'Maximum Subarray Sum',
        testCases: [
          { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', isSample: 1, marks: 25 },
          { input: '1\n1', output: '1', isSample: 1, marks: 25 },
          { input: '5\n5 4 -1 7 8', output: '23', isSample: 0, marks: 25 },
          { input: '3\n-1 -2 -3', output: '-1', isSample: 0, marks: 25 }
        ]
      }
    ];

    for (const problem of assignmentProblems) {
      // Check if test cases exist
      const existing = await get('SELECT COUNT(*) as count FROM test_cases WHERE problem_id = ?', [problem.id]);
      
      if (existing.count === 0) {
        console.log(`  Adding test cases for: ${problem.title}`);
        for (const tc of problem.testCases) {
          await run(`
            INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, marks)
            VALUES (?, ?, ?, ?, 0, ?)
          `, [problem.id, tc.input, tc.output, tc.isSample, tc.marks]);
        }
        console.log(`  ✅ Added ${problem.testCases.length} test cases for ${problem.title}`);
      } else {
        console.log(`  ℹ️ Test cases already exist for ${problem.title}`);
      }
    }

    // ==================== 2. ADD PROBLEM DESCRIPTIONS ====================
    console.log('\n📦 Adding problem descriptions...');
    
    const descriptions = [
      { id: 1, description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Input Format:**
- First line: n (number of elements)
- Second line: n space-separated integers
- Third line: target sum

**Output Format:**
- Two space-separated indices

**Example:**
Input:
4
2 7 11 15
9

Output:
0 1

**Explanation:** nums[0] + nums[1] = 2 + 7 = 9` },
      { id: 2, description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

**Input Format:**
- A single line containing the string

**Output Format:**
- "true" if palindrome, "false" otherwise

**Example:**
Input: A man a plan a canal Panama
Output: true` },
      { id: 3, description: `Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return -1.

You must write an algorithm with O(log n) runtime complexity.

**Input Format:**
- First line: n (number of elements)
- Second line: n space-separated sorted integers
- Third line: target value

**Output Format:**
- Index of target, or -1 if not found

**Example:**
Input:
6
-1 0 3 5 9 12
9

Output: 4` },
      { id: 4, description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

**Input Format:**
- First line: n (number of elements)
- Second line: n space-separated integers

**Output Format:**
- Maximum subarray sum

**Example:**
Input:
9
-2 1 -3 4 -1 2 1 -5 4

Output: 6

**Explanation:** The subarray [4,-1,2,1] has the largest sum 6.` }
    ];

    for (const desc of descriptions) {
      await run('UPDATE problems SET description = ? WHERE id = ?', [desc.description, desc.id]);
      console.log(`  ✅ Updated description for problem ${desc.id}`);
    }

    // ==================== 3. ENSURE SUBMISSIONS TABLE HAS ALL COLUMNS ====================
    console.log('\n📦 Checking submissions table columns...');
    
    const submissionColumns = [
      { name: 'test_cases_passed', type: 'INTEGER DEFAULT 0' },
      { name: 'total_test_cases', type: 'INTEGER DEFAULT 0' },
      { name: 'error_message', type: 'TEXT' },
      { name: 'is_final', type: 'INTEGER DEFAULT 0' }
    ];

    for (const col of submissionColumns) {
      try {
        await run(`ALTER TABLE submissions ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✅ Added column ${col.name}`);
      } catch (e) {
        if (e.message.includes('duplicate column')) {
          console.log(`  ℹ️ Column ${col.name} already exists`);
        } else {
          console.log(`  ⚠️ ${col.name}: ${e.message}`);
        }
      }
    }

    // ==================== 4. ENSURE STUDENT_ASSIGNMENTS TABLE EXISTS ====================
    console.log('\n📦 Checking student_assignments table...');
    
    await run(`
      CREATE TABLE IF NOT EXISTS student_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        status TEXT DEFAULT 'not_started',
        score INTEGER DEFAULT 0,
        started_at DATETIME,
        submitted_at DATETIME,
        time_spent INTEGER DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id),
        UNIQUE(student_id, assignment_id)
      )
    `);
    console.log('  ✅ student_assignments table ready');

    // ==================== 5. ENSURE ALL ASSIGNMENTS HAVE CORRECT STRUCTURE ====================
    console.log('\n📦 Updating assignments structure...');
    
    // Update assignment 1 with proper values
    await run(`
      UPDATE assignments SET 
        total_marks = 100,
        status = 'active'
      WHERE id = 1
    `);
    console.log('  ✅ Assignment 1 updated');

    // ==================== 6. FIX PRACTICE PROBLEMS is_sample FLAG ====================
    console.log('\n📦 Fixing practice problem test case flags...');
    
    // Make sure sample tests have is_sample = 1 correctly
    const practiceTestCases = await all('SELECT id, problem_id, is_sample FROM test_cases WHERE problem_id >= 5');
    console.log(`  Found ${practiceTestCases.length} practice test cases`);

    console.log('\n🎉 All fixes applied successfully!\n');
    
    // Summary
    const problemCount = await get('SELECT COUNT(*) as count FROM problems');
    const testCaseCount = await get('SELECT COUNT(*) as count FROM test_cases');
    const assignmentCount = await get('SELECT COUNT(*) as count FROM assignments');
    
    console.log('📊 Database Summary:');
    console.log(`   - Problems: ${problemCount.count}`);
    console.log(`   - Test Cases: ${testCaseCount.count}`);
    console.log(`   - Assignments: ${assignmentCount.count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

fix();
