// ================================================================
// MySQL Connection Pool Configuration
// Railway + Local Development
// ================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

// Railway: use the MySQL private connection URL
if (process.env.MYSQL_PRIVATE_URL) {
  pool = mysql.createPool(process.env.MYSQL_PRIVATE_URL);
} else {
  // Local development
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_hub',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

module.exports = pool;