/**
 * Database Seed Utility Script
 * Reads and executes schema.sql and seed.sql using mysql2 connection
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runSeed() {
  console.log('🚀 Starting Database Initialization for Campus Hub...');

  // Connect to MySQL server first (without database selected)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    console.log('📦 Reading schema.sql...');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Strip DELIMITER statements for mysql2 multipleStatements execution
    schemaSql = schemaSql.replace(/DELIMITER\s+\/\//g, '').replace(/DELIMITER\s+;/g, '').replace(/\/\//g, ';');

    console.log('⚙️ Executing schema DDL (Tables, Views, Procedures, Triggers)...');
    await connection.query(schemaSql);
    console.log('✅ Schema created successfully!');

    console.log('🌱 Reading seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('💾 Inserting sample dataset (Users, Venues, Events, Resources, Bookings)...');
    await connection.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    console.log('\n🎉 Campus Hub Database setup complete!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Admin:   admin@campushub.com   / Demo@123');
    console.log('Faculty: faculty@campushub.com / Demo@123');
    console.log('Student: student@campushub.com / Demo@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Database Initialization Error:', error.message);
  } finally {
    await connection.end();
  }
}

runSeed();
