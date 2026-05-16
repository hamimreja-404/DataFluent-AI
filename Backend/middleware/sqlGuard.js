require('dotenv').config();
const { Parser } = require('node-sql-parser');
const parser = new Parser();

const DESTRUCTIVE_PATTERNS = [
  { regex: /^\s*DROP\b/i,     type: 'DROP' },
  { regex: /^\s*DELETE\b/i,   type: 'DELETE' },
  { regex: /^\s*TRUNCATE\b/i, type: 'TRUNCATE' },
  { regex: /^\s*ALTER\b/i,    type: 'ALTER' },
  { regex: /^\s*UPDATE\b/i,   type: 'UPDATE' },
  { regex: /^\s*INSERT\b/i,   type: 'INSERT' },
  { regex: /^\s*CREATE\b/i,   type: 'CREATE' },
  { regex: /^\s*RENAME\b/i,   type: 'RENAME' },
  { regex: /^\s*REPLACE\b/i,  type: 'REPLACE' },
];

const isDestructive = (sql) =>
  DESTRUCTIVE_PATTERNS.some(p => p.regex.test(sql.trim()));

const getQueryType = (sql) => {
  const t = sql.trim();
  for (const p of DESTRUCTIVE_PATTERNS) {
    if (p.regex.test(t)) return p.type;
  }
  return 'SELECT';
};

const verifyAdminPassword = (provided) => {
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) return false;
  return provided === adminPwd;
};

// New function to enforce LIMIT 200 on SELECT statements using AST
const enforceLimit = (sql) => {
  try {
    const astList = parser.astify(sql);
    const ast = Array.isArray(astList) ? astList[0] : astList;
    
    // Only apply to SELECT statements
    if (ast && ast.type === 'select') {
      // If no limit is set, enforce LIMIT 200
      if (!ast.limit) {
        ast.limit = {
          seperator: '',
          value: [{ type: 'number', value: 200 }]
        };
      } else if (ast.limit && ast.limit.value && ast.limit.value.length > 0) {
        const valNode = ast.limit.value[ast.limit.value.length - 1]; 
        if (valNode && typeof valNode.value === 'number' && valNode.value > 200) {
          valNode.value = 200;
        }
      }
      const safeSql = parser.sqlify(ast);
      return safeSql.replace(/`/g, ''); // groq prompt says "no backticks", parser sometimes adds them
    }
    return sql;
  } catch (error) {
    console.warn("AST Parser failed to parse SQL, falling back to original:", error.message);
    if (/^\s*SELECT/i.test(sql) && !/LIMIT\s+\d+/i.test(sql)) {
      return sql + ' LIMIT 200';
    }
    return sql;
  }
};

module.exports = { isDestructive, getQueryType, verifyAdminPassword, enforceLimit };
