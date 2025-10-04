import { createPool } from 'mysql2/promise';

// 数据库连接配置 - 根据您的MySQL设置修改
const dbConfig = {
    host: 'localhost',
    user: 'root',                    // 您的MySQL用户名
    password: 'TENGfei032027',              // 您的MySQL密码（改成您实际的密码）
    database: 'charityevents_db',
    charset: 'utf8mb4',
    connectTimeout: 60000,
    // 添加更多配置选项
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 创建连接池
const pool = createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
    try {
        console.log('🔧 尝试连接数据库...');
        const connection = await pool.getConnection();
        console.log('✅ 成功连接到MySQL数据库: charityevents_db');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT COUNT(*) as event_count FROM events');
        console.log(`📊 数据库包含 ${rows[0].event_count} 个活动`);
        
        // 测试分类查询
        const [categories] = await connection.execute('SELECT COUNT(*) as category_count FROM categories');
        console.log(`📋 数据库包含 ${categories[0].category_count} 个分类`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        console.log('🔍 详细错误信息:', error);
        console.log('💡 请检查:');
        console.log('   1. MySQL服务是否正在运行');
        console.log('   2. 用户名和密码是否正确');
        console.log('   3. charityevents_db数据库是否存在');
        console.log('   4. 数据库是否有events和categories表');
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
        console.error('SQL:', sql);
        console.error('参数:', params);
        throw error;
    }
}

export default {
    pool,
    testConnection,
    executeQuery
};