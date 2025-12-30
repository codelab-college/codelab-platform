import Database from '../database/Database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/codelab.db');

async function initializeDatabase() {
  console.log('Initializing database...');
  const db = new Database(dbPath);
  
  try {
    await db.initialize();
    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await db.close();
  }
}

initializeDatabase();
