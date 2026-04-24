const pool = require('../db');

async function seedHalfYearly() {
  const sellerId = 'SEL001';
  const year = 2024;
  
  try {
    // Seed H1 2024
    const rev1 = 1250000;
    const comm1 = rev1 * 0.1;
    const net1 = rev1 - comm1;
    await pool.query(
      `INSERT INTO half_yearly_finances (half_yearly_finances_id, seller_id, half_number, year, total_revenue, platform_commission, net_seller_earnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
      [`HY-1-${year}`, sellerId, 1, year, rev1, comm1, net1]
    );

    // Seed H2 2024
    const rev2 = 1850000;
    const comm2 = rev2 * 0.1;
    const net2 = rev2 - comm2;
    await pool.query(
      `INSERT INTO half_yearly_finances (half_yearly_finances_id, seller_id, half_number, year, total_revenue, platform_commission, net_seller_earnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
      [`HY-2-${year}`, sellerId, 2, year, rev2, comm2, net2]
    );

    console.log("✅ Half-Yearly mock data seeded for SEL001.");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

seedHalfYearly();
