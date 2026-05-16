CREATE DATABASE IF NOT EXISTS berger_paints;
USE berger_paints;


-- VERIFY ALL TABLES

SELECT 'regions' AS table_name, COUNT(*) AS total_rows FROM regions
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'complaints', COUNT(*) FROM complaints;