const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./database/event_db');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// 导入路由
const apiRoutes = require('./api/routes/events');

// 使用API路由
app.use('/api', apiRoutes);

// 页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.get('/search.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'search.html'));
});

app.get('/event-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'event-details.html'));
});

// 健康检查
app.get('/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();
        res.json({
            status: 'healthy',
            database: dbStatus ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.url} was not found`
    });
});

// 错误处理
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 启动服务器
async function startServer() {
    try {
        console.log('🚀 Starting Charity Events Server...');
        
        // 测试数据库连接
        const dbConnected = await testConnection();
        
        app.listen(PORT, () => {
            console.log('\n🎉 CHARITY EVENTS SERVER STARTED!');
            console.log('==========================================');
            console.log(`📍 Server: http://localhost:${PORT}`);
            console.log(`📊 Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
            
            console.log('\n🌐 Pages:');
            console.log(`   Home: http://localhost:${PORT}/`);
            console.log(`   Search: http://localhost:${PORT}/search.html`);
            console.log(`   Details: http://localhost:${PORT}/event-details.html`);
            
            console.log('\n🔧 API:');
            console.log(`   Categories: http://localhost:${PORT}/api/categories`);
            console.log(`   Events: http://localhost:${PORT}/api/events`);
            console.log(`   Health: http://localhost:${PORT}/health`);
            console.log('==========================================\n');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();