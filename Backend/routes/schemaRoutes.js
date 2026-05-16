const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/schema — all tables + columns from information_schema
router.get('/schema', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [process.env.DB_NAME]
    );
    const tablesMap = {};
    rows.forEach(r => {
      if (!tablesMap[r.TABLE_NAME]) tablesMap[r.TABLE_NAME] = { name: r.TABLE_NAME, columns: [] };
      tablesMap[r.TABLE_NAME].columns.push({ name: r.COLUMN_NAME, type: r.DATA_TYPE, fullType: r.COLUMN_TYPE });
    });
    res.json({ tables: Object.values(tablesMap) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load schema', details: err.message });
  }
});

// GET /api/health — live DB connection check
router.get('/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ status: 'connected', database: process.env.DB_NAME });
  } catch (err) {
    res.status(500).json({ status: 'disconnected', error: err.message });
  }
});

module.exports = router;
