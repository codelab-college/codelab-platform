import Database from '../database/Database.js';

const db = new Database('./database/codelab.db');

async function fix() {
  try {
    // Add missing columns
    try {
      await db.run("ALTER TABLE assignments ADD COLUMN detect_violations INTEGER DEFAULT 1");
      console.log('Added detect_violations column');
    } catch (e) {
      console.log('detect_violations already exists or error:', e.message);
    }

    try {
      await db.run("ALTER TABLE assignments ADD COLUMN allowed_languages TEXT DEFAULT 'python,javascript,cpp'");
      console.log('Added allowed_languages column');
    } catch (e) {
      console.log('allowed_languages already exists or error:', e.message);
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fix();
