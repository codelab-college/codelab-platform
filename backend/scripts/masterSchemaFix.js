// Master Database Schema Fix Script
// This consolidates ALL tables and columns in one place
// Run with: node backend/scripts/masterSchemaFix.js

import sqlite3Pkg from 'sqlite3';
import bcrypt from 'bcryptjs';
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
  console.log('✅ Connected to database\n');
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

// Helper to safely add column
async function addColumnIfNotExists(table, column, definition) {
  try {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`  ✅ Added ${table}.${column}`);
    return true;
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log(`  ℹ️ ${table}.${column} already exists`);
      return false;
    }
    throw e;
  }
}

async function fix() {
  try {
    console.log('🔧 MASTER SCHEMA FIX - Starting comprehensive database repair...\n');
    console.log('=' .repeat(60) + '\n');

    // ==================== 1. USERS TABLE ====================
    console.log('📦 [1/11] Fixing USERS table...');
    await addColumnIfNotExists('users', 'department', 'TEXT');
    await addColumnIfNotExists('users', 'semester', 'INTEGER');
    await addColumnIfNotExists('users', 'section', 'TEXT');
    await addColumnIfNotExists('users', 'phone', 'TEXT');
    await addColumnIfNotExists('users', 'is_active', 'INTEGER DEFAULT 1');
    console.log('');

    // ==================== 2. ASSIGNMENTS TABLE ====================
    console.log('📦 [2/11] Fixing ASSIGNMENTS table...');
    await addColumnIfNotExists('assignments', 'is_hidden', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('assignments', 'access_type', "TEXT DEFAULT 'all'");
    await addColumnIfNotExists('assignments', 'selected_students', 'TEXT');
    await addColumnIfNotExists('assignments', 'proctoring_enabled', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('assignments', 'allow_copy_paste', 'INTEGER DEFAULT 1');
    await addColumnIfNotExists('assignments', 'show_results', 'INTEGER DEFAULT 1');
    await addColumnIfNotExists('assignments', 'instructions', 'TEXT');
    await addColumnIfNotExists('assignments', 'is_closed', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('assignments', 'detect_violations', 'INTEGER DEFAULT 1');
    await addColumnIfNotExists('assignments', 'allowed_languages', "TEXT DEFAULT 'python,javascript,cpp'");
    console.log('');

    // ==================== 3. PROBLEMS TABLE ====================
    console.log('📦 [3/11] Fixing PROBLEMS table...');
    await addColumnIfNotExists('problems', 'is_practice', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('problems', 'tags', 'TEXT');
    await addColumnIfNotExists('problems', 'order_index', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('problems', 'time_limit', 'INTEGER DEFAULT 5000');
    await addColumnIfNotExists('problems', 'memory_limit', 'INTEGER DEFAULT 256');
    await addColumnIfNotExists('problems', 'constraints', 'TEXT');
    await addColumnIfNotExists('problems', 'hints', 'TEXT');
    console.log('');

    // ==================== 4. SUBMISSIONS TABLE ====================
    console.log('📦 [4/11] Fixing SUBMISSIONS table...');
    await addColumnIfNotExists('submissions', 'test_cases_passed', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('submissions', 'total_test_cases', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('submissions', 'error_message', 'TEXT');
    await addColumnIfNotExists('submissions', 'is_final', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('submissions', 'memory_used', 'INTEGER');
    console.log('');

    // ==================== 5. STUDENT_ASSIGNMENTS TABLE ====================
    console.log('📦 [5/11] Fixing STUDENT_ASSIGNMENTS table...');
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
        violations INTEGER DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id),
        UNIQUE(student_id, assignment_id)
      )
    `);
    await addColumnIfNotExists('student_assignments', 'violations', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('student_assignments', 'time_spent', 'INTEGER DEFAULT 0');
    console.log('  ✅ student_assignments table ready');
    console.log('');

    // ==================== 6. SETTINGS TABLE ====================
    console.log('📦 [6/11] Creating SETTINGS table...');
    await run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add description column if missing
    await addColumnIfNotExists('settings', 'description', 'TEXT');
    
    // Insert default settings (without description for compatibility)
    const defaultSettings = [
      ['platform_name', 'CodeLab'],
      ['max_submission_size', '65536'],
      ['execution_timeout', '5000'],
      ['enable_practice_mode', 'true'],
      ['enable_badges', 'true'],
      ['plagiarism_threshold', '70'],
      ['allow_registration', 'false'],
      ['maintenance_mode', 'false']
    ];
    
    for (const [key, value] of defaultSettings) {
      await run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
    }
    console.log('  ✅ settings table ready with defaults');
    console.log('');

    // ==================== 7. BADGES TABLE ====================
    console.log('📦 [7/11] Creating BADGES table...');
    await run(`
      CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        color TEXT,
        condition_type TEXT NOT NULL,
        condition_value INTEGER NOT NULL,
        points INTEGER DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if needed
    await addColumnIfNotExists('badges', 'color', 'TEXT');
    await addColumnIfNotExists('badges', 'points', 'INTEGER DEFAULT 10');

    // Insert badges (simpler format for compatibility)
    const badges = [
      ['First Blood', 'Solve your first problem', '🎯', 'problems_solved', 1],
      ['Problem Solver I', 'Solve 10 problems', '⭐', 'problems_solved', 10],
      ['Problem Solver II', 'Solve 25 problems', '🌟', 'problems_solved', 25],
      ['Problem Solver III', 'Solve 50 problems', '💫', 'problems_solved', 50],
      ['Problem Solver IV', 'Solve 100 problems', '🏆', 'problems_solved', 100],
      ['Streak Starter', 'Get a 3-day streak', '🔥', 'daily_streak', 3],
      ['Streak Master', 'Get a 7-day streak', '🔥', 'daily_streak', 7],
      ['Streak Legend', 'Get a 30-day streak', '🔥', 'daily_streak', 30],
      ['Easy Peasy', 'Solve 10 easy problems', '🟢', 'easy_solved', 10],
      ['Medium Rare', 'Solve 10 medium problems', '🟡', 'medium_solved', 10],
      ['Hard Worker', 'Solve 10 hard problems', '🔴', 'hard_solved', 10],
      ['Speed Demon', 'Solve a problem in under 5 minutes', '⚡', 'fast_solve', 1],
      ['Perfectionist', 'Get 100% score on 5 assignments', '💯', 'perfect_assignments', 5],
      ['Night Owl', 'Submit code between 12AM-5AM', '🦉', 'night_submissions', 1],
      ['Early Bird', 'Submit code between 5AM-7AM', '🐦', 'early_submissions', 1],
      ['Consistent', 'Submit at least once for 14 days', '📅', 'daily_streak', 14],
      ['Bug Hunter', 'Submit 50 times', '🐛', 'total_submissions', 50],
      ['Practice Makes Perfect', 'Solve 20 practice problems', '📚', 'practice_solved', 20],
      ['All Rounder', 'Solve problems in 3 different languages', '🌐', 'languages_used', 3]
    ];

    for (const [name, desc, icon, condType, condVal] of badges) {
      try {
        await run(`INSERT OR IGNORE INTO badges (name, description, icon, condition_type, condition_value) VALUES (?, ?, ?, ?, ?)`,
          [name, desc, icon, condType, condVal]);
      } catch (e) {
        // Ignore duplicate errors
      }
    }
    console.log('  ✅ badges table ready with 19 badges');
    console.log('');

    // ==================== 8. USER_BADGES TABLE ====================
    console.log('📦 [8/11] Creating USER_BADGES table...');
    await run(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        badge_id INTEGER NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id),
        UNIQUE(user_id, badge_id)
      )
    `);
    console.log('  ✅ user_badges table ready');
    console.log('');

    // ==================== 9. SAVED_CODE TABLE ====================
    console.log('📦 [9/11] Creating SAVED_CODE table...');
    await run(`
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
    console.log('  ✅ saved_code table ready');
    console.log('');

    // ==================== 10. ENSURE ADMIN USER ====================
    console.log('📦 [10/11] Ensuring admin user exists...');
    const admin = await get("SELECT id FROM users WHERE role = 'admin'");
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await run(`
        INSERT INTO users (usn, email, password, name, role, is_active)
        VALUES ('ADMIN001', 'admin@codelab.com', ?, 'Administrator', 'admin', 1)
      `, [hashedPassword]);
      console.log('  ✅ Admin user created (USN: ADMIN001, Password: admin123)');
    } else {
      console.log('  ℹ️ Admin user already exists');
    }
    console.log('');

    // ==================== 11. ENSURE PRACTICE ASSIGNMENT ====================
    console.log('📦 [11/11] Ensuring practice assignment exists (ID 0)...');
    const practiceAssignment = await get("SELECT id FROM assignments WHERE id = 0");
    if (!practiceAssignment) {
      const teacher = await get("SELECT id FROM users WHERE role = 'teacher' LIMIT 1");
      const teacherId = teacher?.id || 1;
      await run(`
        INSERT INTO assignments (id, title, description, teacher_id, due_date, status, total_marks, is_hidden)
        VALUES (0, 'Practice Mode', 'Practice problems without time limits', ?, '2099-12-31', 'active', 0, 1)
      `, [teacherId]);
      console.log('  ✅ Practice assignment created (ID: 0)');
    } else {
      console.log('  ℹ️ Practice assignment already exists');
    }
    console.log('');

    // ==================== FINAL SUMMARY ====================
    console.log('=' .repeat(60));
    console.log('\n🎉 MASTER SCHEMA FIX COMPLETED!\n');

    const tables = await all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const problemCount = await get('SELECT COUNT(*) as count FROM problems');
    const testCaseCount = await get('SELECT COUNT(*) as count FROM test_cases');
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    const badgeCount = await get('SELECT COUNT(*) as count FROM badges');

    console.log('📊 Database Summary:');
    console.log(`   Tables: ${tables.map(t => t.name).join(', ')}`);
    console.log(`   Problems: ${problemCount.count}`);
    console.log(`   Test Cases: ${testCaseCount.count}`);
    console.log(`   Users: ${userCount.count}`);
    console.log(`   Badges: ${badgeCount.count}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

fix();
