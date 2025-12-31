import Database from '../database/Database.js';

const db = new Database('./database/codelab.db');

async function createPracticeAssignment() {
  try {
    // First check if it exists
    const existing = await db.get('SELECT id FROM assignments WHERE id = 0');
    if (existing) {
      console.log('Practice assignment already exists');
      return;
    }

    // Create practice assignment with ID 0
    await db.run(`
      INSERT INTO assignments (id, title, description, teacher_id, due_date, status, total_marks, created_at, is_hidden)
      VALUES (0, 'Practice Mode', 'Practice problems without time limits', 6, '2099-12-31', 'active', 0, datetime('now'), 1)
    `);
    
    console.log('Practice assignment created with ID 0');
    
    // Verify
    const assignment = await db.get('SELECT * FROM assignments WHERE id = 0');
    console.log('Verified:', assignment);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createPracticeAssignment();
