const express = require('express');
const cors = require('cors');
require('dotenv').config();

const queryRoutes = require('./routes/queryRoutes');
const schemaRoutes = require('./routes/schemaRoutes');
const suggestRoutes = require('./routes/suggestRoutes');
const anomalyCron = require('./services/anomalyCron');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', queryRoutes);
app.use('/api', schemaRoutes);
app.use('/api', suggestRoutes);

// KPI & Anomaly Routes
app.get('/api/kpi', (req, res) => {
  res.json({
    success: true,
    data: anomalyCron.store.kpiData,
    report: anomalyCron.store.synthesisReport,
    lastUpdated: anomalyCron.store.lastUpdated
  });
});

app.get('/', (_, res) => res.json({ message: 'DataFluent AI — API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DataFluent AI server running → http://localhost:${PORT}`);
  anomalyCron.init();
});