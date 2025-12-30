import Database from '../database/Database.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/codelab.db');

async function seedDatabase() {
  console.log('Seeding database with sample data...');
  const db = new Database(dbPath);

  try {
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create sample students
    const students = [
      { usn: '1MS21CS001', name: 'Rahul Kumar', email: 'rahul@college.edu', department: 'CSE', semester: 3 },
      { usn: '1MS21CS002', name: 'Priya Sharma', email: 'priya@college.edu', department: 'CSE', semester: 3 },
      { usn: '1MS21CS003', name: 'Amit Patel', email: 'amit@college.edu', department: 'CSE', semester: 3 },
      { usn: '1MS21CS004', name: 'Sneha Reddy', email: 'sneha@college.edu', department: 'CSE', semester: 3 },
      { usn: '1MS21CS005', name: 'Vikram Singh', email: 'vikram@college.edu', department: 'CSE', semester: 3 },
    ];

    for (const student of students) {
      await db.run(
        `INSERT OR IGNORE INTO users (usn, name, email, password, role, department, semester) 
         VALUES (?, ?, ?, ?, 'student', ?, ?)`,
        [student.usn, student.name, student.email, hashedPassword, student.department, student.semester]
      );
    }

    // Create sample teachers
    const teachers = [
      { usn: 'TCSE001', name: 'Dr. Rajesh Verma', email: 'rajesh@college.edu', department: 'CSE' },
      { usn: 'TCSE002', name: 'Prof. Anjali Mehta', email: 'anjali@college.edu', department: 'CSE' },
    ];

    for (const teacher of teachers) {
      await db.run(
        `INSERT OR IGNORE INTO users (usn, name, email, password, role, department) 
         VALUES (?, ?, ?, ?, 'teacher', ?)`,
        [teacher.usn, teacher.name, teacher.email, hashedPassword, teacher.department]
      );
    }

    // Create sample admin
    await db.run(
      `INSERT OR IGNORE INTO users (usn, name, email, password, role) 
       VALUES ('ADMIN001', 'System Admin', 'admin@college.edu', ?, 'admin')`,
      [hashedPassword]
    );

    // Get teacher ID
    const teacher = await db.get(`SELECT id FROM users WHERE usn = 'TCSE001'`);

    // Create sample assignment
    const assignmentResult = await db.run(
      `INSERT INTO assignments (title, description, teacher_id, due_date, is_timed, duration_minutes, total_marks) 
       VALUES (?, ?, ?, datetime('now', '+7 days'), 0, NULL, 100)`,
      ['Data Structures - Assignment 1', 'Basic problems on arrays, strings, and searching algorithms', teacher.id]
    );

    const assignmentId = assignmentResult.lastID;

    // Create sample problems
    const problems = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers and a target sum, find two numbers that add up to the target.',
        input_format: 'First line: n (size of array)\nSecond line: n space-separated integers\nThird line: target sum',
        output_format: 'Two space-separated indices (0-indexed) of the numbers that add up to target',
        constraints: '2 <= n <= 10^4\n-10^9 <= arr[i] <= 10^9',
        difficulty: 'easy',
        marks: 20
      },
      {
        title: 'Valid Palindrome',
        description: 'Check if a given string is a palindrome, ignoring spaces and case.',
        input_format: 'A single string (may contain spaces and mixed case)',
        output_format: 'Print "YES" if palindrome, "NO" otherwise',
        constraints: '1 <= length <= 10^5',
        difficulty: 'easy',
        marks: 15
      },
      {
        title: 'Binary Search',
        description: 'Implement binary search on a sorted array.',
        input_format: 'First line: n (size of array)\nSecond line: n space-separated sorted integers\nThird line: target element',
        output_format: 'Index of target element (0-indexed), or -1 if not found',
        constraints: '1 <= n <= 10^6\nArray is sorted in ascending order',
        difficulty: 'medium',
        marks: 25
      },
      {
        title: 'Maximum Subarray Sum',
        description: 'Find the contiguous subarray with the maximum sum (Kadane\'s Algorithm).',
        input_format: 'First line: n (size of array)\nSecond line: n space-separated integers',
        output_format: 'Maximum sum of contiguous subarray',
        constraints: '1 <= n <= 10^5\n-10^4 <= arr[i] <= 10^4',
        difficulty: 'medium',
        marks: 40
      }
    ];

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const problemResult = await db.run(
        `INSERT INTO problems (assignment_id, title, description, input_format, output_format, constraints, difficulty, marks, order_index) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [assignmentId, problem.title, problem.description, problem.input_format, problem.output_format, 
         problem.constraints, problem.difficulty, problem.marks, i + 1]
      );

      // Add sample test cases for first problem (Two Sum)
      if (i === 0) {
        const problemId = problemResult.lastID;
        
        // Sample test case (visible)
        await db.run(
          `INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, marks) 
           VALUES (?, ?, ?, 1, 0, 0)`,
          [problemId, '4\n2 7 11 15\n9', '0 1']
        );

        // Hidden test cases
        await db.run(
          `INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, marks) 
           VALUES (?, ?, ?, 0, 1, 10)`,
          [problemId, '5\n3 2 4 1 5\n6', '1 2']
        );

        await db.run(
          `INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, marks) 
           VALUES (?, ?, ?, 0, 1, 10)`,
          [problemId, '3\n1 2 3\n5', '1 2']
        );
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('Student: USN: 1MS21CS001, Password: password123');
    console.log('Teacher: USN: TCSE001, Password: password123');
    console.log('Admin: USN: ADMIN001, Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await db.close();
  }
}

seedDatabase();
