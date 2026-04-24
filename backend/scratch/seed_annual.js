const pool = require('../db');

async function seedAnnual() {
  const sellerId = 'SEL001';
  
  try {
    // Seed Annual (Last 3 years)
    const years = [2022, 2023, 2024];
    for (const year of years) {
      const rev = Math.floor(Math.random() * 5000000) + 1000000;
      const comm = rev * 0.1;
      const net = rev - comm;
      await pool.query(
        `INSERT INTO annual_finances (annual_finance_id, seller_id, year, total_revenue, platform_commission, net_seller_earnings)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [`AF-${year}`, sellerId, year, rev, comm, net]
      );
    }

    console.log("✅ Annual mock data seeded for SEL001.");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

seedAnnual();
