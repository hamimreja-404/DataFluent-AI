const Groq = require('groq-sdk');
require('dotenv').config();

// Single client, single model — llama-3.1-8b-instant has a much higher TPD limit.
// Switch MODEL back to 'llama-3.3-70b-versatile' after quota resets (next UTC midnight).
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.1-8b-instant';

const call = (messages, maxTokens = 512, temperature = 0) =>
  groq.chat.completions.create({ model: MODEL, messages, temperature, max_tokens: maxTokens });

// ── Schema Definitions ───────────────────────────────────────────────────────────
const TABLES = {
  regions: `- regions     (region_id PK, region_name, zone)   zone: 'North','South','East','West'`,
  categories: `- categories  (category_id PK, category_name, description)`,
  products: `- products    (product_id PK, product_name, category_id→categories, unit_price, unit, color, stock_available)`,
  customers: `- customers   (customer_id PK, customer_name, customer_type, region_id→regions, phone, email)\n               customer_type: 'Premium','Standard','Dealer'`,
  employees: `- employees   (employee_id PK, employee_name, department, designation, region_id→regions, salary, join_date)`,
  sales: `- sales       (sale_id PK, product_id→products, customer_id→customers, employee_id→employees,\n               region_id→regions, quantity, unit_price, total_amount, sale_date, payment_status)\n               payment_status: 'Paid','Pending','Overdue'`,
  inventory: `- inventory   (inventory_id PK, product_id→products, region_id→regions, stock_quantity, reorder_level, last_updated)`,
  complaints: `- complaints  (complaint_id PK, customer_id→customers, product_id→products, complaint_text, status, complaint_date, resolved_date)\n               status: 'Open','Resolved','Pending'`
};

// Semantic Mapping (Schema RAG)
const getRelevantSchema = (question) => {
  const q = question.toLowerCase();
  const selected = new Set();

  if (q.match(/region|zone|north|south|east|west/)) selected.add('regions');
  if (q.match(/category|type/)) selected.add('categories');
  if (q.match(/product|paint|color|price|item/)) selected.add('products');
  if (q.match(/customer|client|dealer|premium/)) selected.add('customers');
  if (q.match(/employee|staff|manager|salary|department/)) selected.add('employees');
  if (q.match(/sale|sell|revenue|profit|amount|payment|paid|invoice|sold/)) selected.add('sales');
  if (q.match(/inventory|stock|reorder|available/)) selected.add('inventory');
  if (q.match(/complaint|issue|open|resolved/)) selected.add('complaints');

  // Fallback: If no specific keywords match, include the most common analytical tables
  if (selected.size === 0) {
    selected.add('sales');
    selected.add('products');
    selected.add('customers');
  }

  // Always include dependent tables for JOINs
  if (selected.has('sales')) { selected.add('products'); selected.add('customers'); selected.add('regions'); }
  if (selected.has('inventory')) { selected.add('products'); selected.add('regions'); }
  if (selected.has('products')) { selected.add('categories'); }

  let schemaStr = `Database: berger_paints\n\nTables (PK = primary key, → = foreign key):\n`;
  for (const table of selected) {
    schemaStr += TABLES[table] + '\n';
  }
  
  return schemaStr;
};

// NL → SQL
const textToSQL = async (question) => {
  const dynamicSchema = getRelevantSchema(question);
  
  const r = await call([
    {
      role: 'system',
      content: `MySQL expert for Berger Paints.\n${dynamicSchema}\nRules:
1. Generate valid MySQL matching the intent exactly.
2. SELECT: proper JOINs + aliases, LIMIT 200 unless specified.
3. INSERT: realistic sample values matching column types.
4. UPDATE/DELETE/ALTER/DROP: precise SQL.
5. Return ONLY raw SQL — no backticks, markdown or explanation.
6. No trailing semicolon.`,
    },
    { role: 'user', content: question },
  ], 1024);
  
  const rawResponse = r.choices[0].message.content;
  const cleanSql = rawResponse
    .replace(/```sql/gi, '')
    .replace(/```/g, '')
    .trim()
    .replace(/;$/, '');
    
  return cleanSql;
};

// 1-sentence business insight
const getInsight = async (question, sql, data, columns) => {
  try {
    const r = await call([
      { role: 'system', content: 'Berger Paints analyst. ONE insight sentence (max 25 words) using real numbers. No preamble.' },
      { role: 'user',   content: `Q: ${question}\nCols: ${columns.join(', ')}\nData: ${JSON.stringify(data.slice(0, 6))}` },
    ], 80, 0.3);
    return r.choices[0].message.content.trim();
  } catch { return null; }
};

// Best chart type
const getChartRecommendation = async (question, columns, data) => {
  try {
    if (columns.length < 2) return null;
    const isNumeric = data.slice(0, 5).every(row => !isNaN(parseFloat(Object.values(row)[1])));
    if (!isNumeric) return null;
    const r = await call([
      { role: 'system', content: 'ONE word only: bar, line, pie, or area.' },
      { role: 'user',   content: `Q: "${question}" Cols: ${columns.join(', ')}` },
    ], 5);
    const t = r.choices[0].message.content.trim().toLowerCase();
    return ['bar', 'line', 'pie', 'area'].includes(t) ? t : 'bar';
  } catch { return 'bar'; }
};

// Error reason + fix
const analyzeError = async (sql, mysqlError) => {
  try {
    const r = await call([
      {
        role: 'system',
        content: 'MySQL expert. Two lines only:\nLine 1: "Reason: <why>"\nLine 2: "Fix: <suggestion>"',
      },
      { role: 'user', content: `SQL: ${sql}\nError: ${mysqlError}` },
    ], 100);
    return r.choices[0].message.content.trim();
  } catch { return null; }
};

// Ghost-text next-word completion — uses .withResponse() to read rate-limit header
const getNextWordCompletion = async (currentText) => {
  try {
    const { data: r, response: raw } = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Complete the next 2-4 words of a Berger Paints database question.
Tables: sales, products, customers, employees, regions, inventory, complaints.
Return ONLY the words to ADD (no repetition). Max 5 words. No punctuation.
"show top" → "5 products by revenue"
"which region" → "has highest total sales"`,
        },
        { role: 'user', content: currentText },
      ],
      temperature: 0.2,
      max_tokens: 15,
    }).withResponse();

    const remainingTokens = parseInt(raw.headers?.get?.('x-ratelimit-remaining-tokens') || '0') || null;
    return { completion: r.choices[0].message.content.trim(), remainingTokens };
  } catch {
    return { completion: '', remainingTokens: null };
  }
};

// Generate synthesis report from KPI data
const generateSynthesisReport = async (kpiData) => {
  try {
    const r = await call([
      {
        role: 'system',
        content: `You are a Supply Chain & Credit Guard AI for Berger Paints.
You are given raw KPI and anomaly data from the database.
Write a 3-4 sentence professional synthesis report. Point out critical issues like low stock or high pending payments. Keep it actionable and concise. No markdown formatting.`,
      },
      { role: 'user', content: JSON.stringify(kpiData) },
    ], 150, 0.4);
    return r.choices[0].message.content.trim();
  } catch {
    return "Failed to generate synthesis report.";
  }
};

module.exports = { textToSQL, getInsight, getChartRecommendation, analyzeError, getNextWordCompletion, generateSynthesisReport };