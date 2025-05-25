import mysql from 'mysql2/promise';

async function testDB() {
  const connection = await mysql.createConnection({
    host: 'dbms-dbugproject-meimeielin-f6ca.l.aivencloud.com',
    port: 13451,
    user: 'avnadmin',
    password: 'AVNS_-WxxKl7iirtDDsRQAQZ',
    database: 'defaultdb',
    ssl: {
      rejectUnauthorized: false,
    },
  }) as any; // 👈 關鍵！讓 TS 不擋我們 query()

  try {
    const [rows] = await connection.query('SELECT 1');
    console.log('✅ 成功連接資料庫！', rows);
    await connection.end();
  } catch (error) {
    console.error('❌ 連線失敗：', error);
  }
}

testDB();
