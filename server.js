const express = require('express');
const cors = require('cors');
const { testConnection, executeQuery } = require('./database/event_db').default;

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('client'));

// 基础路由 - 测试服务器和数据库
app.get('/', async (req, res) => {
    try {
        const dbStatus = await testConnection();
        res.json({
            project: 'Web-A2 - Charity Events Management',
            status: '🚀 服务器运行正常',
            database: dbStatus ? '✅ 连接正常' : '❌ 连接失败',
            timestamp: new Date().toLocaleString(),
            endpoints: [
                'GET /api/categories - 获取所有分类',
                'GET /api/events - 获取所有活动',
                'GET /api/events/active - 获取活跃活动',
                'GET /api/events/:id - 获取特定活动详情'
            ]
        });
    } catch (error) {
        res.status(500).json({ error: '服务器错误: ' + error.message });
    }
});

// API路由 - 分类
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await executeQuery('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: '获取分类失败: ' + error.message });
    }
});

// API路由 - 所有活动
app.get('/api/events', async (req, res) => {
    try {
        const events = await executeQuery(`
            SELECT e.*, c.name as category_name
            FROM events e
            JOIN categories c ON e.category_id = c.id
            ORDER BY e.date_time
        `);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: '获取活动失败: ' + error.message });
    }
});

// API路由 - 活跃活动（用于首页）
app.get('/api/events/active', async (req, res) => {
    try {
        const events = await executeQuery(`
            SELECT e.*, c.name as category_name
            FROM events e
            JOIN categories c ON e.category_id = c.id
            WHERE e.is_active = TRUE
            ORDER BY e.date_time
        `);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: '获取活跃活动失败: ' + error.message });
    }
});

// API路由 - 特定活动详情
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const events = await executeQuery(`
            SELECT e.*, c.name as category_name
            FROM events e
            JOIN categories c ON e.category_id = c.id
            WHERE e.id = ?
        `, [eventId]);

        if (events.length === 0) {
            return res.status(404).json({ error: '活动未找到' });
        }

        res.json(events[0]);
    } catch (error) {
        res.status(500).json({ error: '获取活动详情失败: ' + error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🎯 Web-A2 服务器运行在 http://localhost:${PORT}`);
    console.log('💡 可用命令:');
    console.log('   npm run test-db - 测试数据库连接');
    console.log('   npm start - 启动服务器');
    console.log('   npm run dev - 开发模式启动（需要nodemon）');
});