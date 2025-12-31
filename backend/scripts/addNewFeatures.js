// Database migration script for new features
// Run with: node backend/scripts/addNewFeatures.js

import Database from '../database/Database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('🚀 Starting database migration for new features...\n');
  
  const dbPath = path.join(__dirname, '../database/codelab.db');
  const db = new Database(dbPath);
  await db.initialize();

  try {
    // ==================== SETTINGS TABLE ====================
    console.log('📦 Creating settings table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default settings
    const defaultSettings = [
      ['platform_name', 'CodeLab'],
      ['max_submission_size', '65536'],
      ['execution_timeout', '5000'],
      ['enable_practice_mode', 'true'],
      ['enable_badges', 'true'],
      ['plagiarism_threshold', '70'],
      ['default_password', 'password123']
    ];

    for (const [key, value] of defaultSettings) {
      await db.run(`
        INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
      `, [key, value]);
    }
    console.log('✅ Settings table created\n');

    // ==================== BADGES TABLE ====================
    console.log('📦 Creating badges table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        condition TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert badge definitions
    const badges = [
      ['first_blood', 'First Blood', 'Solve your first problem', '🎯', '{"type":"problems_solved","count":1}'],
      ['problem_solver_10', 'Problem Solver', 'Solve 10 problems', '🧩', '{"type":"problems_solved","count":10}'],
      ['problem_solver_25', 'Code Warrior', 'Solve 25 problems', '⚔️', '{"type":"problems_solved","count":25}'],
      ['problem_solver_50', 'Algorithm Master', 'Solve 50 problems', '🏆', '{"type":"problems_solved","count":50}'],
      ['problem_solver_100', 'Legendary Coder', 'Solve 100 problems', '👑', '{"type":"problems_solved","count":100}'],
      ['streak_3', 'Hat Trick', '3 correct submissions in a row', '🎩', '{"type":"streak","count":3}'],
      ['streak_5', 'On Fire', '5 correct submissions in a row', '🔥', '{"type":"streak","count":5}'],
      ['streak_10', 'Unstoppable', '10 correct submissions in a row', '💫', '{"type":"streak","count":10}'],
      ['easy_5', 'Easy Peasy', 'Solve 5 Easy problems', '🌱', '{"type":"difficulty","difficulty":"easy","count":5}'],
      ['medium_5', 'Getting Warmer', 'Solve 5 Medium problems', '🌟', '{"type":"difficulty","difficulty":"medium","count":5}'],
      ['hard_3', 'Hard Mode', 'Solve 3 Hard problems', '💎', '{"type":"difficulty","difficulty":"hard","count":3}'],
      ['hard_10', 'Genius', 'Solve 10 Hard problems', '🧠', '{"type":"difficulty","difficulty":"hard","count":10}'],
      ['speed_demon', 'Speed Demon', 'Solve a problem in under 5 minutes', '⚡', '{"type":"speed","minutes":5}'],
      ['daily_7', 'Week Warrior', 'Submit code for 7 consecutive days', '📅', '{"type":"daily_streak","days":7}'],
      ['daily_30', 'Monthly Master', 'Submit code for 30 consecutive days', '🗓️', '{"type":"daily_streak","days":30}'],
      ['polyglot', 'Polyglot', 'Solve problems in 3 different languages', '🌐', '{"type":"languages","count":3}'],
      ['perfectionist', 'Perfectionist', 'Get 100% on 5 assignments', '💯', '{"type":"perfect_assignments","count":5}'],
      ['contest_first', 'Contest Champion', 'Win first place in a contest', '🥇', '{"type":"contest_rank","rank":1}'],
      ['contest_top3', 'Podium Finish', 'Finish in top 3 in a contest', '🏅', '{"type":"contest_rank","rank":3}']
    ];

    for (const [id, name, description, icon, condition] of badges) {
      await db.run(`
        INSERT OR IGNORE INTO badges (id, name, description, icon, condition) VALUES (?, ?, ?, ?, ?)
      `, [id, name, description, icon, condition]);
    }
    console.log('✅ Badges table created\n');

    // ==================== USER BADGES TABLE ====================
    console.log('📦 Creating user_badges table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        badge_id TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id),
        UNIQUE(user_id, badge_id)
      )
    `);
    console.log('✅ User badges table created\n');

    // ==================== MODIFY PROBLEMS TABLE FOR PRACTICE MODE ====================
    // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
    // But first check if this has already been done
    console.log('📦 Checking problems table structure...');
    const tableInfo = await db.all(`PRAGMA table_info(problems)`);
    const assignmentIdColumn = tableInfo.find(col => col.name === 'assignment_id');
    
    if (assignmentIdColumn && assignmentIdColumn.notnull === 1) {
      console.log('📦 Modifying problems table to allow NULL assignment_id for practice problems...');
      
      // Create new table with nullable assignment_id
      await db.run(`
        CREATE TABLE IF NOT EXISTS problems_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assignment_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          difficulty TEXT,
          marks INTEGER DEFAULT 10,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_practice INTEGER DEFAULT 0,
          tags TEXT,
          FOREIGN KEY (assignment_id) REFERENCES assignments(id)
        )
      `);
      
      // Copy data
      await db.run(`INSERT INTO problems_new SELECT id, assignment_id, title, description, difficulty, marks, created_at, 0, NULL FROM problems`);
      
      // Drop old table
      await db.run(`DROP TABLE problems`);
      
      // Rename new table
      await db.run(`ALTER TABLE problems_new RENAME TO problems`);
      
      console.log('✅ Problems table modified for practice mode\n');
    } else {
      console.log('ℹ️ Problems table already supports practice mode\n');
    }

    // ==================== ADD is_practice COLUMN TO PROBLEMS ====================
    console.log('📦 Ensuring is_practice column exists...');
    try {
      await db.run(`ALTER TABLE problems ADD COLUMN is_practice INTEGER DEFAULT 0`);
      console.log('✅ Added is_practice column\n');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('ℹ️ is_practice column already exists\n');
      } else {
        throw e;
      }
    }

    // ==================== ADD tags COLUMN TO PROBLEMS ====================
    console.log('📦 Ensuring tags column exists...');
    try {
      await db.run(`ALTER TABLE problems ADD COLUMN tags TEXT`);
      console.log('✅ Added tags column\n');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('ℹ️ tags column already exists\n');
      } else {
        throw e;
      }
    }

    // ==================== SAVED CODE TABLE ====================
    console.log('📦 Creating saved_code table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS saved_code (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        problem_id INTEGER NOT NULL,
        code TEXT,
        language TEXT DEFAULT 'python',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (problem_id) REFERENCES problems(id),
        UNIQUE(user_id, problem_id)
      )
    `);
    console.log('✅ Saved code table created\n');

    // ==================== ADD SAMPLE PRACTICE PROBLEMS ====================
    console.log('📦 Adding sample practice problems...');
    
    const practiceProblems = [
      {
        title: 'Hello World',
        description: 'Write a program that prints "Hello, World!" to the console.',
        difficulty: 'easy',
        marks: 10,
        tags: 'basics,output',
        testCases: [
          { input: '', output: 'Hello, World!', isSample: true }
        ]
      },
      {
        title: 'Sum of Two Numbers',
        description: 'Given two integers a and b, print their sum.\n\n**Input:**\nTwo space-separated integers a and b.\n\n**Output:**\nPrint the sum of a and b.',
        difficulty: 'easy',
        marks: 10,
        tags: 'basics,math,input',
        testCases: [
          { input: '3 5', output: '8', isSample: true },
          { input: '100 200', output: '300', isSample: true },
          { input: '-5 10', output: '5', isSample: false }
        ]
      },
      {
        title: 'Reverse a String',
        description: 'Given a string s, print it in reverse order.\n\n**Input:**\nA single string s.\n\n**Output:**\nThe reversed string.',
        difficulty: 'easy',
        marks: 15,
        tags: 'strings,basics',
        testCases: [
          { input: 'hello', output: 'olleh', isSample: true },
          { input: 'CodeLab', output: 'baLedoC', isSample: true },
          { input: 'a', output: 'a', isSample: false }
        ]
      },
      {
        title: 'Palindrome Check',
        description: 'Given a string s, determine if it is a palindrome.\n\n**Input:**\nA single string s (lowercase letters only).\n\n**Output:**\nPrint "YES" if s is a palindrome, otherwise print "NO".',
        difficulty: 'easy',
        marks: 20,
        tags: 'strings,palindrome',
        testCases: [
          { input: 'madam', output: 'YES', isSample: true },
          { input: 'hello', output: 'NO', isSample: true },
          { input: 'racecar', output: 'YES', isSample: false }
        ]
      },
      {
        title: 'Fibonacci Number',
        description: 'Given an integer n, find the nth Fibonacci number.\n\nThe Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, ...\n\n**Input:**\nA single integer n (0 ≤ n ≤ 30).\n\n**Output:**\nThe nth Fibonacci number.',
        difficulty: 'medium',
        marks: 25,
        tags: 'recursion,dynamic-programming,math',
        testCases: [
          { input: '0', output: '0', isSample: true },
          { input: '1', output: '1', isSample: true },
          { input: '10', output: '55', isSample: true },
          { input: '20', output: '6765', isSample: false }
        ]
      },
      {
        title: 'Prime Number Check',
        description: 'Given an integer n, determine if it is a prime number.\n\n**Input:**\nA single integer n (2 ≤ n ≤ 10^6).\n\n**Output:**\nPrint "YES" if n is prime, otherwise print "NO".',
        difficulty: 'medium',
        marks: 25,
        tags: 'math,prime,number-theory',
        testCases: [
          { input: '7', output: 'YES', isSample: true },
          { input: '10', output: 'NO', isSample: true },
          { input: '97', output: 'YES', isSample: false },
          { input: '100', output: 'NO', isSample: false }
        ]
      },
      {
        title: 'Binary Search',
        description: 'Implement binary search to find a target element in a sorted array.\n\n**Input:**\nFirst line: n (size of array) and target\nSecond line: n sorted integers\n\n**Output:**\nIndex of target (0-based) or -1 if not found.',
        difficulty: 'medium',
        marks: 30,
        tags: 'binary-search,arrays,searching',
        testCases: [
          { input: '5 3\n1 2 3 4 5', output: '2', isSample: true },
          { input: '5 6\n1 2 3 4 5', output: '-1', isSample: true },
          { input: '7 7\n1 3 5 7 9 11 13', output: '3', isSample: false }
        ]
      },
      {
        title: 'Longest Common Subsequence',
        description: 'Find the length of the longest common subsequence of two strings.\n\n**Input:**\nTwo lines, each containing a string.\n\n**Output:**\nLength of the LCS.',
        difficulty: 'hard',
        marks: 40,
        tags: 'dynamic-programming,strings,lcs',
        testCases: [
          { input: 'ABCDGH\nAEDFHR', output: '3', isSample: true },
          { input: 'ABC\nABC', output: '3', isSample: true },
          { input: 'AGGTAB\nGXTXAYB', output: '4', isSample: false }
        ]
      }
    ];

    for (const problem of practiceProblems) {
      // Check if already exists
      const existing = await db.get('SELECT id FROM problems WHERE title = ? AND is_practice = 1', [problem.title]);
      if (existing) {
        console.log(`  ℹ️ Practice problem "${problem.title}" already exists`);
        continue;
      }

      const result = await db.run(`
        INSERT INTO problems (title, description, difficulty, marks, tags, is_practice)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [problem.title, problem.description, problem.difficulty, problem.marks, problem.tags]);

      const problemId = result.lastID;

      // Add test cases
      for (const tc of problem.testCases) {
        await db.run(`
          INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
          VALUES (?, ?, ?, ?)
        `, [problemId, tc.input, tc.output, tc.isSample ? 1 : 0]);
      }
      console.log(`  ✅ Added practice problem: ${problem.title}`);
    }
    console.log('✅ Practice problems added\n');

    // ==================== ADD admin ROLE ====================
    console.log('📦 Checking for admin user...');
    const adminExists = await db.get("SELECT id FROM users WHERE role = 'admin'");
    if (!adminExists) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      await db.run(`
        INSERT INTO users (name, email, usn, password, role, department)
        VALUES ('Admin', 'admin@codelab.edu', 'ADMIN001', ?, 'admin', 'Administration')
      `, [hashedPassword]);
      console.log('✅ Admin user created (USN: ADMIN001, Password: admin123)\n');
    } else {
      console.log('ℹ️ Admin user already exists\n');
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Settings table with default values');
    console.log('   - Badges table with 19 achievement badges');
    console.log('   - User badges tracking table');
    console.log('   - Practice problems support');
    console.log('   - Saved code table');
    console.log('   - Admin user (USN: ADMIN001)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrate();
