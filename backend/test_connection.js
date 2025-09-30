// test_connection.js - 测试数据库连接
const mysql = require('mysql2');

// 创建数据库连接 - 确保密码改成你的真实密码！
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TENGfei032027', // 改成你的MySQL密码
    database: 'charityevents_db'
});

console.log('正在测试数据库连接...');

// 测试连接
connection.connect((error) => {
    if (error) {
        console.error('❌ 数据库连接失败: ', error.message);
        return;
    }
    console.log('✅ 成功连接到 charityevents_db 数据库');
    
    // 测试查询数据
    testDataQuery();
});

// 测试查询数据
function testDataQuery() {
    console.log('\n正在测试数据查询...');
    
    // 查询分类
    connection.query('SELECT * FROM categories', (error, categories) => {
        if (error) {
            console.error('❌ 查询分类失败: ', error.message);
            return;
        }
        console.log('✅ 分类数据查询成功:');
        console.log(categories);
        
        // 查询活动
        connection.query('SELECT * FROM events', (error, events) => {
            if (error) {
                console.error('❌ 查询活动失败: ', error.message);
                return;
            }
            console.log('\n✅ 活动数据查询成功:');
            console.log(`找到 ${events.length} 个活动`);
            
            // 显示前3个活动作为示例
            events.slice(0, 3).forEach(event => {
                console.log(`- ${event.name} ($${event.ticket_price})`);
            });
            
            // 关闭连接
            connection.end();
            console.log('\n🎉 数据库连接测试完成！');
        });
    });
}