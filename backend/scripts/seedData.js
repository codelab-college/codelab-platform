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

    // Add practice problems
    const practiceProblems = [
      {
        title: 'Hello World',
        description: 'Write a program that prints "Hello, World!" to the console.',
        input_format: 'No input',
        output_format: 'Print "Hello, World!"',
        constraints: 'None',
        difficulty: 'easy',
        marks: 10,
        tags: 'basics,output'
      },
      {
        title: 'Sum of Two Numbers',
        description: 'Given two integers, print their sum.',
        input_format: 'Two space-separated integers a and b',
        output_format: 'Sum of a and b',
        constraints: '-1000 <= a, b <= 1000',
        difficulty: 'easy',
        marks: 10,
        tags: 'basics,math'
      },
      {
        title: 'Factorial',
        description: 'Calculate the factorial of a given number n.',
        input_format: 'A single integer n',
        output_format: 'Factorial of n',
        constraints: '0 <= n <= 12',
        difficulty: 'easy',
        marks: 15,
        tags: 'math,loops'
      },
      {
        title: 'Fibonacci Number',
        description: 'Find the nth Fibonacci number.',
        input_format: 'A single integer n',
        output_format: 'The nth Fibonacci number',
        constraints: '1 <= n <= 30',
        difficulty: 'medium',
        marks: 20,
        tags: 'math,recursion,dynamic-programming'
      },
      {
        title: 'Reverse String',
        description: 'Given a string, reverse it and print the result.',
        input_format: 'A single string s',
        output_format: 'Reversed string',
        constraints: '1 <= length(s) <= 1000',
        difficulty: 'easy',
        marks: 10,
        tags: 'strings,basics'
      },
      {
        title: 'Prime Check',
        description: 'Determine if a given number is prime.',
        input_format: 'A single integer n',
        output_format: 'YES if prime, NO otherwise',
        constraints: '2 <= n <= 10^6',
        difficulty: 'medium',
        marks: 20,
        tags: 'math,number-theory'
      }
    ];

    for (const problem of practiceProblems) {
      const result = await db.run(
        `INSERT INTO problems (assignment_id, title, description, input_format, output_format, constraints, difficulty, marks, is_practice, tags) 
         VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [problem.title, problem.description, problem.input_format, problem.output_format, 
         problem.constraints, problem.difficulty, problem.marks, problem.tags]
      );
      const practiceId = result.lastID;

      // Add test cases for practice problems
      if (problem.title === 'Hello World') {
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 1, 0)`, [practiceId, '', 'Hello, World!']);
      } else if (problem.title === 'Sum of Two Numbers') {
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 1, 0)`, [practiceId, '3 5', '8']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '-10 20', '10']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '0 0', '0']);
      } else if (problem.title === 'Factorial') {
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 1, 0)`, [practiceId, '5', '120']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '0', '1']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '10', '3628800']);
      } else if (problem.title === 'Fibonacci Number') {
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 1, 0)`, [practiceId, '10', '55']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '1', '1']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '20', '6765']);
      } else if (problem.title === 'Reverse String') {
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 1, 0)`, [practiceId, 'hello', 'olleh']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, 'world', 'dlrow']);
      } else if (problem.title === 'Prime Check') {
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 1, 0)`, [practiceId, '7', 'YES']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '4', 'NO']);
        await db.run(`INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES (?, ?, ?, 0, 1)`, [practiceId, '997', 'YES']);
      }
    }

    // Add badges
    const badges = [
      { name: 'First Steps', description: 'Solve your first problem', icon: '🎯', condition: JSON.stringify({ type: 'problems_solved', count: 1 }) },
      { name: 'Getting Started', description: 'Solve 5 problems', icon: '⭐', condition: JSON.stringify({ type: 'problems_solved', count: 5 }) },
      { name: 'Problem Solver', description: 'Solve 10 problems', icon: '🏆', condition: JSON.stringify({ type: 'problems_solved', count: 10 }) },
      { name: 'Code Master', description: 'Solve 25 problems', icon: '👑', condition: JSON.stringify({ type: 'problems_solved', count: 25 }) },
      { name: 'Persistent', description: 'Make 50 submissions', icon: '💪', condition: JSON.stringify({ type: 'submissions', count: 50 }) },
      { name: 'Dedicated', description: 'Make 100 submissions', icon: '🔥', condition: JSON.stringify({ type: 'submissions', count: 100 }) }
    ];

    for (const badge of badges) {
      await db.run(
        `INSERT INTO badges (name, description, icon, condition) VALUES (?, ?, ?, ?)`,
        [badge.name, badge.description, badge.icon, badge.condition]
      );
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
