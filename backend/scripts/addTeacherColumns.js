import Database from '../database/Database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/codelab.db');

async function addTeacherColumns() {
  console.log('Adding teacher-specific columns to database...');
  const db = new Database(dbPath);

  try {
    // Add columns to assignments table
    try {
      await db.run(`ALTER TABLE assignments ADD COLUMN detect_violations BOOLEAN DEFAULT 1`);
      console.log('✓ Added detect_violations column to assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ detect_violations column already exists');
      } else throw e;
    }

    try {
      await db.run(`ALTER TABLE assignments ADD COLUMN is_hidden BOOLEAN DEFAULT 0`);
      console.log('✓ Added is_hidden column to assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ is_hidden column already exists');
      } else throw e;
    }

    try {
      await db.run(`ALTER TABLE assignments ADD COLUMN is_closed BOOLEAN DEFAULT 0`);
      console.log('✓ Added is_closed column to assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ is_closed column already exists');
      } else throw e;
    }

    try {
      await db.run(`ALTER TABLE assignments ADD COLUMN allowed_languages TEXT DEFAULT 'python,javascript,cpp'`);
      console.log('✓ Added allowed_languages column to assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ allowed_languages column already exists');
      } else throw e;
    }

    // Add violation tracking to student_assignments
    try {
      await db.run(`ALTER TABLE student_assignments ADD COLUMN violations INTEGER DEFAULT 0`);
      console.log('✓ Added violations column to student_assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ violations column already exists');
      } else throw e;
    }

    try {
      await db.run(`ALTER TABLE student_assignments ADD COLUMN violation_details TEXT`);
      console.log('✓ Added violation_details column to student_assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ violation_details column already exists');
      } else throw e;
    }

    // Add access_type column to assignments (all/selected)
    try {
      await db.run(`ALTER TABLE assignments ADD COLUMN access_type TEXT DEFAULT 'all'`);
      console.log('✓ Added access_type column to assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ access_type column already exists');
      } else throw e;
    }

    // Add selected_students column to assignments (comma-separated USNs)
    try {
      await db.run(`ALTER TABLE assignments ADD COLUMN selected_students TEXT`);
      console.log('✓ Added selected_students column to assignments');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('✓ selected_students column already exists');
      } else throw e;
    }

    console.log('\n✅ All teacher columns added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await db.close();
  }
}

addTeacherColumns();
