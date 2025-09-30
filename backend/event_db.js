const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // 替换为你的MySQL用户名
  password: 'TENGfei032027', // 替换为你的MySQL密码
  database: 'charityevents_db'
});

connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败: ' + err.stack);
    return;
  }
  console.log('成功连接到数据库,连接ID: ' + connection.threadId);
});

module.exports = connection;
