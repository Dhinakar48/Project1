const pool = require('../db');

async function seedQuarterly() {
  const sellerId = 'SEL001';
  const year = 2024;
  
  try {
    for (let q = 1; q <= 4; q++) {
      const rev = Math.floor(Math.random() * 900000) + 500000;
      const comm = rev * 0.1;
      const net = rev - comm;
      await pool.query(
        `INSERT INTO quarterly_finances (quarterly_finance_id, seller_id, quarter_number, year, total_revenue, platform_commission, net_seller_earnings)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [`QR-${q}-${year}`, sellerId, q, year, rev, comm, net]
      );
    }

    console.log("✅ Quarterly mock data seeded for SEL001.");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

seedQuarterly();
