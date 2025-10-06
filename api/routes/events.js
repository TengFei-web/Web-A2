const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../database/event_db');

// GET /api/categories - 获取所有分类
router.get('/categories', async (req, res) => {
    try {
        const categories = await executeQuery(
            'SELECT * FROM categories ORDER BY name'
        );
        
        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
        
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories',
            message: error.message
        });
    }
});

// GET /api/events - 获取所有活动（支持查询参数）
router.get('/events', async (req, res) => {
    try {
        const { category, location, date, active } = req.query;
        
        let query = `
            SELECT 
                e.*,
                c.name as category_name,
                c.description as category_description
            FROM events e
            JOIN categories c ON e.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        
        // 过滤活跃活动
        if (active === 'true') {
            query += ' AND e.is_active = TRUE';
        }
        
        // 按分类过滤
        if (category) {
            query += ' AND e.category_id = ?';
            params.push(category);
        }
        
        // 按位置过滤
        if (location) {
            query += ' AND e.location LIKE ?';
            params.push(`%${location}%`);
        }
        
        // 按日期过滤
        if (date) {
            query += ' AND DATE(e.date_time) = ?';
            params.push(date);
        }
        
        query += ' ORDER BY e.date_time ASC';
        
        const events = await executeQuery(query, params);
        
        res.json({
            success: true,
            data: events,
            count: events.length,
            filters: {
                category,
                location,
                date,
                active
            }
        });
        
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events',
            message: error.message
        });
    }
});

// GET /api/events/active - 获取活跃活动（主页专用）
router.get('/events/active', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.*,
                c.name as category_name
            FROM events e
            JOIN categories c ON e.category_id = c.id
            WHERE e.is_active = TRUE 
            AND e.date_time >= NOW()
            ORDER BY e.date_time ASC
        `;
        
        const events = await executeQuery(query);
        
        res.json({
            success: true,
            data: events,
            count: events.length,
            message: 'Active upcoming events retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching active events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch active events',
            message: error.message
        });
    }
});

// GET /api/events/:id - 获取特定活动详情
router.get('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        
        // 验证ID格式
        if (!eventId || isNaN(eventId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid event ID format'
            });
        }
        
        const query = `
            SELECT 
                e.*,
                c.name as category_name,
                c.description as category_description
            FROM events e
            JOIN categories c ON e.category_id = c.id
            WHERE e.id = ?
        `;
        
        const events = await executeQuery(query, [eventId]);
        
        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            data: events[0]
        });
        
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event details',
            message: error.message
        });
    }
});

// GET /api/events/search/suggestions - 获取搜索建议（位置和分类）
router.get('/events/search/suggestions', async (req, res) => {
    try {
        // 获取所有唯一位置
        const locationsQuery = `
            SELECT DISTINCT location 
            FROM events 
            WHERE is_active = TRUE 
            ORDER BY location
        `;
        
        // 获取所有分类
        const categoriesQuery = `
            SELECT id, name 
            FROM categories 
            ORDER BY name
        `;
        
        const [locations, categories] = await Promise.all([
            executeQuery(locationsQuery),
            executeQuery(categoriesQuery)
        ]);
        
        res.json({
            success: true,
            data: {
                locations: locations.map(l => l.location),
                categories: categories
            }
        });
        
    } catch (error) {
        console.error('Error fetching search suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch search suggestions',
            message: error.message
        });
    }
});

// GET /api/events/stats/summary - 获取活动统计摘要
router.get('/events/stats/summary', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_events,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_events,
                SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_events,
                SUM(goal_amount) as total_goal_amount,
                SUM(current_amount) as total_raised_amount,
                AVG(goal_amount) as average_goal_amount
            FROM events
        `;
        
        const [stats] = await executeQuery(query);
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error fetching event stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event statistics',
            message: error.message
        });
    }
});

module.exports = router;