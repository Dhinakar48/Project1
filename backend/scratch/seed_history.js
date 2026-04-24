const pool = require('../db');

async function seedHistory() {
  const sellerId = 'SEL001';
  
  try {
    // Seed Weekly (Last 8 weeks)
    for (let i = 1; i <= 8; i++) {
      const rev = Math.floor(Math.random() * 200000) + 50000;
      const comm = rev * 0.1;
      const net = rev - comm;
      await pool.query(
        `INSERT INTO weekly_finances (weekly_finance_id, seller_id, week_number, year, total_revenue, platform_commission, net_seller_earnings)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [`WF-${i}-2024`, sellerId, i, 2024, rev, comm, net]
      );
    }

    // Seed Monthly (Last 6 months)
    for (let i = 1; i <= 6; i++) {
      const rev = Math.floor(Math.random() * 800000) + 200000;
      const comm = rev * 0.1;
      const net = rev - comm;
      await pool.query(
        `INSERT INTO monthly_finances (monthly_finance_id, seller_id, month_number, year, total_revenue, platform_commission, net_seller_earnings)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [`MF-${i}-2024`, sellerId, i, 2024, rev, comm, net]
      );
    }

    console.log("✅ Weekly and Monthly mock data seeded for SEL001.");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

seedHistory();
