import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'jeweller_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  try {
    // Hash the password
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Generated password hash:', passwordHash);
    
    // Update the admin user with the correct password hash
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE email = $2 AND role = 'ADMIN'
       RETURNING id, email, name, role`,
      [passwordHash, 'admin@samplejewellers.com']
    );
    
    if (result.rowCount === 0) {
      console.log('No admin user found. Creating new admin...');
      
      // First, get or create a jeweller
      let jewellerId = '550e8400-e29b-41d4-a716-446655440000';
      const jewellerCheck = await pool.query(
        'SELECT id FROM jewellers WHERE id = $1',
        [jewellerId]
      );
      
      if (jewellerCheck.rowCount === 0) {
        console.log('Creating sample jeweller...');
        await pool.query(
          `INSERT INTO jewellers (id, business_name, contact_email, contact_phone, branding_config, margin_percentage, margin_fixed, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            jewellerId,
            'Sample Jewellers',
            'admin@samplejewellers.com',
            '+919876543210',
            JSON.stringify({
              app_name: 'Sample Gold',
              primary_color: '#FFD700',
              secondary_color: '#FFA500',
              logo_url: '',
              splash_url: ''
            }),
            2.50,
            0.00,
            true
          ]
        );
      }
      
      // Create admin user
      const adminResult = await pool.query(
        `INSERT INTO users (jeweller_id, phone_number, name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, name, role`,
        [
          jewellerId,
          '+919876543210',
          'Admin User',
          'admin@samplejewellers.com',
          passwordHash,
          'ADMIN',
          true
        ]
      );
      
      console.log('✅ Admin user created:', adminResult.rows[0]);
    } else {
      console.log('✅ Admin password updated:', result.rows[0]);
    }
    
    console.log('\n📧 Email: admin@samplejewellers.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
