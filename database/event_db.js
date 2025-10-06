const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'TENGfei032027',
    database: 'charityevents_db',
    charset: 'utf8mb4',
    connectTimeout: 60000
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 成功连接到MySQL数据库: charityevents_db');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as event_count FROM events');
        console.log(`📊 数据库包含 ${rows[0].event_count} 个活动`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        console.log('💡 请检查:');
        console.log('   1. MySQL服务是否运行');
        console.log('   2. 数据库连接配置是否正确');
        console.log('   3. charityevents_db数据库是否存在');
        return false;
    }
}

// 执行查询
async function executeQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ 查询执行失败:', error.message);
        throw error;
    }
}

// 正确导出（不要使用export default）
module.exports = {
    pool,
    testConnection,
    executeQuery
};