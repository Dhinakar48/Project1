const pool = require('../db');

async function insertMockData() {
  const sellerId = 'SEL001';
  const records = [];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const totalRev = Math.floor(Math.random() * 50000) + 10000;
    const commission = totalRev * 0.1;
    const net = totalRev - commission;
    
    records.push({
      id: `DF-${Math.random().toString(36).substring(7).toUpperCase()}`,
      sellerId,
      date: dateStr,
      totalRev,
      commission,
      net
    });
  }

  try {
    for (const r of records) {
      await pool.query(
        `INSERT INTO daily_finances (daily_finance_id, seller_id, finance_date, total_revenue, platform_commissions, net_seller_earnings)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [r.id, r.sellerId, r.date, r.totalRev, r.commission, r.net]
      );
    }
    console.log("✅ 10 days of mock financial data inserted for SEL001.");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

insertMockData();
