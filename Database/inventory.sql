USE berger_paints;
-- TABLE 7: INVENTORY

CREATE TABLE inventory (
  inventory_id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT,
  region_id INT,
  stock_quantity INT,
  reorder_level INT,
  last_updated DATE,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

INSERT INTO inventory (product_id, region_id, stock_quantity, reorder_level, last_updated) VALUES
(1, 1, 120, 50, '2024-05-01'),
(2, 1, 80, 40, '2024-05-01'),
(3, 2, 60, 30, '2024-05-01'),
(4, 2, 45, 25, '2024-05-01'),
(5, 3, 200, 80, '2024-05-01'),
(6, 3, 110, 50, '2024-05-01'),
(7, 4, 95, 40, '2024-05-01'),
(8, 4, 70, 35, '2024-05-01'),
(9, 5, 55, 20, '2024-05-01'),
(10, 5, 88, 40, '2024-05-01'),
(11, 6, 30, 15, '2024-05-01'),
(12, 6, 65, 30, '2024-05-01'),
(13, 7, 150, 60, '2024-05-01'),
(14, 7, 75, 35, '2024-05-01'),
(15, 8, 240, 100, '2024-05-01'),
(16, 8, 50, 20, '2024-05-01'),
(17, 9, 130, 55, '2024-05-01'),
(18, 9, 90, 40, '2024-05-01'),
(19, 10, 60, 25, '2024-05-01'),
(20, 10, 85, 35, '2024-05-01');