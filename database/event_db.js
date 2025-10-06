const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'TENGfei032027',
    database: 'charityevents_db',
    charset: 'utf8mb4',
    connectTimeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to MySQL database: charityevents_db');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as event_count FROM events');
        console.log(`📊 The database contains ${rows[0].event_count} events`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Please check:');
        console.log('   1. Whether the MySQL service is running');
        console.log('   2. Whether the database connection configuration is correct');
        console.log('   3. Whether the charityevents_db database exists');
        return false;
    }
}

// Execute query
async function executeQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ Query execution failed:', error.message);
        throw error;
    }
}

// Export correctly (do not use export default)
module.exports = {
    pool,
    testConnection,
    executeQuery
};