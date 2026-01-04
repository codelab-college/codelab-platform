import Database from '../database/Database.js';
import bcrypt from 'bcryptjs';

const db = new Database('./database/codelab.db');

async function checkAdmin() {
  try {
    const admin = await db.get("SELECT id, usn, name, role, password FROM users WHERE role = 'admin'");
    console.log('Admin user:', admin ? { id: admin.id, usn: admin.usn, name: admin.name, role: admin.role } : 'NOT FOUND');
    
    if (admin) {
      // Test password
      const testPassword = 'password123';
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log('Password "password123" valid:', isValid);
      
      if (!isValid) {
        // Update password
        const hash = await bcrypt.hash('password123', 10);
        await db.run('UPDATE users SET password = ? WHERE id = ?', [hash, admin.id]);
        console.log('Password updated to "password123"');
      }
    } else {
      // Create admin
      const hash = await bcrypt.hash('admin123', 10);
      await db.run(`
        INSERT INTO users (usn, name, email, password, role, department)
        VALUES ('ADMIN001', 'System Admin', 'admin@codelab.com', ?, 'admin', 'Administration')
      `, [hash]);
      console.log('Admin created: ADMIN001 / admin123');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin();
