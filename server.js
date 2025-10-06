const express = require('express');
const cors = require('cors');
const { testConnection } = require('./database/event_db');

const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('client'));

// API路由
const eventsRouter = require('./api/routes/events');
app.use('/api', eventsRouter);

// 健康检查端点
app.get('/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbStatus ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
        
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// 根路径 - API文档
app.get('/', (req, res) => {
    res.json({
        project: 'Web-A2 - Charity Events Management',
        version: '1.0.0',
        status: '🚀 API Server Running',
        timestamp: new Date().toLocaleString(),
        documentation: {
            base_url: 'http://localhost:3000/api',
            endpoints: {
                'GET /categories': 'Get all event categories',
                'GET /events': 'Get all events with optional filtering',
                'GET /events/active': 'Get active upcoming events for homepage',
                'GET /events/:id': 'Get specific event details',
                'GET /events/search/suggestions': 'Get search suggestions',
                'GET /events/stats/summary': 'Get events statistics'
            },
            query_parameters: {
                '/events': {
                    'category': 'Filter by category ID',
                    'location': 'Filter by location (partial match)',
                    'date': 'Filter by specific date (YYYY-MM-DD)',
                    'active': 'Filter active events only (true/false)'
                }
            }
        }
    });
});

// 404处理 - 无效API路径
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        requested_path: req.originalUrl,
        available_endpoints: [
            '/api/categories',
            '/api/events',
            '/api/events/active',
            '/api/events/:id',
            '/api/events/search/suggestions',
            '/api/events/stats/summary'
        ]
    });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🎯 Web-A2 API Server running on http://localhost:${PORT}`);
    console.log('📚 Available API Endpoints:');
    console.log('   GET  /api/categories                  - Get all categories');
    console.log('   GET  /api/events                     - Get all events (with filters)');
    console.log('   GET  /api/events/active              - Get active events for homepage');
    console.log('   GET  /api/events/:id                 - Get event details');
    console.log('   GET  /api/events/search/suggestions  - Get search suggestions');
    console.log('   GET  /api/events/stats/summary       - Get statistics');
    console.log('   GET  /health                         - Health check');
    console.log('');
    console.log('💡 Usage examples:');
    console.log('   http://localhost:3000/api/events?active=true');
    console.log('   http://localhost:3000/api/events?category=1&location=Sydney');
    console.log('   http://localhost:3000/api/events/2');
});