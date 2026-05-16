const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');
const { textToSQL, getInsight, getChartRecommendation, analyzeError } = require('../services/grockService');
const { exportToExcel }   = require('../services/excelService');
const { isDestructive, getQueryType, verifyAdminPassword, enforceLimit } = require('../middleware/sqlGuard');
const lruCache = require('../services/lruCache');
const md5 = require('md5');

router.post('/ask', async (req, res) => {
  let sql = null;                                
  try {
    const { question, adminPassword } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'Question is required' });

    // LRU Cache Lookup (Hash the normalized question)
    const cacheKey = md5(question.trim().toLowerCase());
    const cachedResponse = lruCache.get(cacheKey);
    if (cachedResponse && !adminPassword) { // don't serve from cache if trying to authorize a destructive op
      return res.json({ ...cachedResponse, cached: true, executionTime: 0 });
    }

    sql = await textToSQL(question.trim());
    const queryType = getQueryType(sql);

    // Gate destructive ops
    if (isDestructive(sql)) {
      if (!adminPassword)
        return res.json({ requiresAuth: true, queryType, sql, message: `${queryType} requires admin password.` });
      if (!verifyAdminPassword(adminPassword))
        return res.status(403).json({ error: 'Wrong admin password.', requiresAuth: true, queryType, sql });
    } else {
      // Enforce limit using AST parsing on SELECT queries
      sql = enforceLimit(sql);
    }

    const t0 = Date.now();
    const [result] = await pool.execute(sql);
    const ms = Date.now() - t0;

    const isSelect = Array.isArray(result);
    const rows     = isSelect ? result : [];
    const columns  = rows.length > 0 ? Object.keys(rows[0]) : [];

    let insight = null, recommendedChart = null;
    if (isSelect && rows.length > 0) {
      [insight, recommendedChart] = await Promise.all([
        getInsight(question, sql, rows, columns),
        getChartRecommendation(question, columns, rows),
      ]);
    }

    const responsePayload = {
      success: true, question, sql, queryType,
      isDML: !isSelect,
      affectedRows: isSelect ? null : result.affectedRows,
      insertId:     isSelect ? null : (result.insertId || null),
      columns, data: rows,
      total:         isSelect ? rows.length : result.affectedRows,
      executionTime: ms,
      insight, recommendedChart,
    };

    // Cache the response if it was a SELECT query
    if (isSelect) {
      lruCache.put(cacheKey, responsePayload);
    }

    res.json(responsePayload);

  } catch (err) {
    console.error('[ask]', err.message);
    const analysis = sql ? await analyzeError(sql, err.message).catch(() => null) : null;
    res.status(500).json({
      error:    'Query failed',
      details:  err.message,   
      sql,                     
      analysis,                
    });
  }
});

router.post('/export', async (req, res) => {
  try {
    const buf = await exportToExcel(req.body.data, req.body.columns);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=berger_report.xlsx');
    res.send(buf);
  } catch { res.status(500).json({ error: 'Export failed' }); }
});

module.exports = router;