const Groq = require('groq-sdk');
require('dotenv').config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DB_SCHEMA_BRIEF = `
Tables: regions(region_id, region_name, zone),
categories(category_id, category_name, description),
products(product_id, product_name, category_id, unit_price, unit, color, stock_available),
customers(customer_id, customer_name, customer_type, region_id, phone, email),
employees(employee_id, employee_name, department, designation, region_id, salary, join_date),
sales(sale_id, product_id, customer_id, employee_id, region_id, quantity, unit_price, total_amount, sale_date, payment_status),
inventory(inventory_id, product_id, region_id, stock_quantity, reorder_level, last_updated),
complaints(complaint_id, customer_id, product_id, complaint_text, status, complaint_date, resolved_date)
`.trim();

const getSuggestions = async (partial) => {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an autocomplete assistant for Berger Paints database queries.
Database schema: ${DB_SCHEMA_BRIEF}
Given a partial natural-language question, return EXACTLY a JSON array of 4 complete questions.
Rules: Each suggestion must start differently. Be specific about Berger Paints data.
Return ONLY the JSON array. No markdown. No explanation.
Example output: ["Show top 5 products by revenue","Show all pending orders","...","..."]`,
      },
      { role: 'user', content: partial },
    ],
    temperature: 0.6,
    max_tokens: 250,
  });

  const raw = response.choices[0].message.content.trim();
  try {
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return parsed.filter(s => typeof s === 'string').slice(0, 4);
    }
  } catch (_) {}
  return [];
};

module.exports = { getSuggestions };
