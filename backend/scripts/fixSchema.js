import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = sqlite3.verbose();
const dbPath = path.join(__dirname, '../database/codelab.db');

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

const alterCommands = [
  "ALTER TABLE assignments ADD COLUMN access_type TEXT DEFAULT 'all'"
];

let completed = 0;
alterCommands.forEach(sql => {
  db.run(sql, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('Column already exists');
      } else {
        console.log('Error:', err.message);
      }
    } else {
      console.log('Success:', sql);
    }
    completed++;
    if (completed === alterCommands.length) {
      db.close();
      console.log('Done');
    }
  });
});
