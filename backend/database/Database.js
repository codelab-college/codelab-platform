import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const sqlite = sqlite3.verbose();

class Database {
  constructor(dbPath) {
    this.db = new sqlite.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });

    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  // Custom run method that returns lastID and changes
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async initialize() {
    await this.run('PRAGMA foreign_keys = ON');

    // Users table
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usn VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        department VARCHAR(50),
        semester INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assignments table
    await this.run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        teacher_id INTEGER NOT NULL,
        due_date DATETIME,
        is_timed BOOLEAN DEFAULT 0,
        duration_minutes INTEGER,
        total_marks INTEGER DEFAULT 100,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `);

    // Problems table
    await this.run(`
      CREATE TABLE IF NOT EXISTS problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        input_format TEXT,
        output_format TEXT,
        constraints TEXT,
        difficulty VARCHAR(20) DEFAULT 'medium',
        marks INTEGER DEFAULT 10,
        time_limit INTEGER DEFAULT 1000,
        memory_limit INTEGER DEFAULT 256,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
      )
    `);

    // Test cases table
    await this.run(`
      CREATE TABLE IF NOT EXISTS test_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem_id INTEGER NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        is_sample BOOLEAN DEFAULT 0,
        is_hidden BOOLEAN DEFAULT 1,
        marks INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
      )
    `);

    // Submissions table
    await this.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        problem_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        language VARCHAR(20) NOT NULL,
        verdict VARCHAR(20),
        score INTEGER DEFAULT 0,
        execution_time INTEGER,
        memory_used INTEGER,
        test_cases_passed INTEGER DEFAULT 0,
        total_test_cases INTEGER DEFAULT 0,
        error_message TEXT,
        is_final BOOLEAN DEFAULT 0,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (problem_id) REFERENCES problems(id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id)
      )
    `);

    // Student assignments table (tracks student progress)
    await this.run(`
      CREATE TABLE IF NOT EXISTS student_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'not_started',
        started_at DATETIME,
        submitted_at DATETIME,
        score INTEGER DEFAULT 0,
        UNIQUE(student_id, assignment_id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id)
      )
    `);

    // Contests table
    await this.run(`
      CREATE TABLE IF NOT EXISTS contests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        duration_minutes INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'upcoming',
        rules TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Contest problems (links problems to contests)
    await this.run(`
      CREATE TABLE IF NOT EXISTS contest_problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contest_id INTEGER NOT NULL,
        problem_id INTEGER NOT NULL,
        order_index INTEGER DEFAULT 0,
        UNIQUE(contest_id, problem_id),
        FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
      )
    `);

    // Leaderboard entries
    await this.run(`
      CREATE TABLE IF NOT EXISTS leaderboard_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contest_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        penalty INTEGER DEFAULT 0,
        problems_solved INTEGER DEFAULT 0,
        last_submission DATETIME,
        rank INTEGER,
        UNIQUE(contest_id, student_id),
        FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id)
      )
    `);

    // Notifications table
    await this.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT 0,
        link VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create indexes for better performance
    await this.run('CREATE INDEX IF NOT EXISTS idx_users_usn ON users(usn)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_leaderboard_contest ON leaderboard_entries(contest_id)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read)');

    console.log('Database tables created successfully');
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default Database;
