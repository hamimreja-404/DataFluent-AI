const cron = require('node-cron');
const pool = require('../db/connection');
const { generateSynthesisReport } = require('./grockService');

// In-memory store for the latest reports and KPI data
const store = {
  kpiData: null,
  synthesisReport: "Initializing Supply Chain Guard...",
  lastUpdated: null
};

const runAnomalyScan = async () => {
  try {
    console.log('[Supply Chain Guard] Running scheduled DB scan...');
    
    // 1. Low Stock
    const [lowStock] = await pool.execute(`
      SELECT p.product_name, i.stock_quantity 
      FROM inventory i 
      JOIN products p ON i.product_id = p.product_id 
      WHERE i.stock_quantity <= i.reorder_level 
      LIMIT 5
    `);

    // 2. Pending Bills
    const [pendingBills] = await pool.execute(`
      SELECT COUNT(*) as pending_count, SUM(total_amount) as total_pending_value 
      FROM sales 
      WHERE payment_status IN ('Pending', 'Overdue')
    `);

    // 3. Region wise sell
    const [regionSales] = await pool.execute(`
      SELECT r.region_name, SUM(s.total_amount) as revenue 
      FROM sales s 
      JOIN regions r ON s.region_id = r.region_id 
      GROUP BY r.region_name
    `);

    // 4. Highest Sell Product
    const [topProduct] = await pool.execute(`
      SELECT p.product_name, SUM(s.quantity) as total_sold 
      FROM sales s 
      JOIN products p ON s.product_id = p.product_id 
      GROUP BY p.product_name 
      ORDER BY total_sold DESC 
      LIMIT 1
    `);

    // 5. Total Profits (Assuming unit_price * quantity is revenue, if we had cost we would do profit. Just use total revenue for today as a proxy for now)
    const [totalSales] = await pool.execute(`
      SELECT SUM(total_amount) as total_revenue_overall FROM sales
    `);

    const data = {
      lowStockCount: lowStock.length,
      lowStockItems: lowStock.map(i => i.product_name),
      pendingBills: pendingBills[0],
      regionSales: regionSales,
      topProduct: topProduct[0],
      totalRevenue: totalSales[0].total_revenue_overall
    };

    store.kpiData = data;
    
    // Generate AI Synthesis
    const report = await generateSynthesisReport(data);
    store.synthesisReport = report;
    store.lastUpdated = new Date();

    console.log('[Supply Chain Guard] Scan complete. Report updated.');
  } catch (err) {
    console.error('[Supply Chain Guard Error]', err.message);
  }
};

// Schedule to run every 5 minutes
cron.schedule('*/5 * * * *', runAnomalyScan);

// Export the store and a method to trigger it manually (for immediate init)
module.exports = {
  store,
  init: () => runAnomalyScan()
};
