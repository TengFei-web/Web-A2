const { testConnection, executeQuery } = require('./event_db').default;

async function runTests() {
    console.log('🧪 测试数据库连接...');
    const connected = await testConnection();
    if (!connected) return;

    try {
        console.log('\n📋 查询分类数据...');
        const categories = await executeQuery('SELECT * FROM categories');
        console.log(`✅ 找到 ${categories.length} 个分类:`);
        categories.forEach(cat => {
            console.log(`   - ${cat.name}: ${cat.description}`);
        });

        console.log('\n🎯 查询活动数据...');
        const events = await executeQuery(`
            SELECT e.id, e.name, e.date_time, c.name as category, e.location, e.ticket_price
            FROM events e
            JOIN categories c ON e.category_id = c.id
            WHERE e.is_active = TRUE
            ORDER BY e.date_time
            LIMIT 5
        `);
        console.log(`✅ 找到 ${events.length} 个活跃活动:`);
        events.forEach(event => {
            const date = new Date(event.date_time).toLocaleDateString();
            console.log(`   - ${event.name} (${event.category}) - ${date} - $${event.ticket_price}`);
        });

        console.log('\n📊 数据库统计信息:');
        const stats = await executeQuery(`
            SELECT
                COUNT(*) as total_events,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_events,
                SUM(goal_amount) as total_goal,
                SUM(current_amount) as total_raised
            FROM events
        `);
        console.log(`   总活动数: ${stats[0].total_events}`);
        console.log(`   活跃活动: ${stats[0].active_events}`);
        console.log(`   总筹款目标: $${stats[0].total_goal}`);
        console.log(`   已筹集: $${stats[0].total_raised}`);

        console.log('\n🎉 数据库测试完成！');
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

runTests();