const { testConnection } = require('./database/event_db');

async function runAPITests() {
    console.log('🧪 API TEST SUITE\n');
    
    // 测试数据库连接
    console.log('1. Testing Database Connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.log('❌ Cannot run API tests without database connection\n');
        return;
    }
    console.log('');
    
    const baseURL = 'http://localhost:3000/api';
    const endpoints = [
        { name: 'GET /categories', url: '/categories' },
        { name: 'GET /events', url: '/events' },
        { name: 'GET /events/active', url: '/events/active' },
        { name: 'GET /events/1', url: '/events/1' },
        { name: 'GET /events/search/suggestions', url: '/events/search/suggestions' },
        { name: 'GET /events/stats/summary', url: '/events/stats/summary' }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint.name}`);
        console.log(`URL: ${baseURL}${endpoint.url}`);
        
        try {
            const response = await fetch(baseURL + endpoint.url);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ SUCCESS: ${response.status} | Records: ${data.count || data.data?.length || 1}`);
                passed++;
            } else {
                console.log(`❌ FAILED: ${response.status} - ${data.error}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            failed++;
        }
        console.log('');
    }
    
    console.log('📊 TEST SUMMARY');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

setTimeout(() => {
    runAPITests().catch(console.error);
}, 2000);