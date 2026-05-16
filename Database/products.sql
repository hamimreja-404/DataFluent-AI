USE berger_paints;

-- TABLE 3: PRODUCTS

CREATE TABLE products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(150),
  category_id INT,
  unit_price DECIMAL(10,2),
  unit VARCHAR(20),
  color VARCHAR(50),
  stock_available INT,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

INSERT INTO products (product_name, category_id, unit_price, unit, color, stock_available) VALUES
('Berger Silk Luxury Emulsion - White', 6, 850.00, '4L', 'White', 320),
('Berger Silk Luxury Emulsion - Ivory', 6, 870.00, '4L', 'Ivory', 210),
('Berger WeatherCoat Anti Dusty', 2, 1100.00, '10L', 'White', 180),
('Berger WeatherCoat Long Life', 2, 1350.00, '10L', 'Cream', 140),
('Berger Bison Acrylic Distemper', 7, 320.00, '5Kg', 'White', 500),
('Berger Bison Acrylic Distemper - Blue', 7, 330.00, '5Kg', 'Blue', 280),
('Berger Easy Clean Interior', 1, 720.00, '4L', 'White', 390),
('Berger Easy Clean - Pastel Pink', 1, 740.00, '4L', 'Pastel Pink', 175),
('Berger Wood Keeper Melamine', 3, 980.00, '1L', 'Clear', 120),
('Berger Metal Guard Primer', 4, 560.00, '4L', 'Red Oxide', 230),
('Berger Damp Proof Coating', 5, 1450.00, '4L', 'White', 95),
('Berger Texture Coat Coarse', 9, 1200.00, '5Kg', 'Sandstone', 160),
('Berger Hi-Gloss Enamel White', 8, 480.00, '1L', 'White', 410),
('Berger Hi-Gloss Enamel Black', 8, 490.00, '1L', 'Black', 190),
('Berger Wall Putty', 10, 580.00, '20Kg', 'White', 620),
('Berger Silk Glamour Deep Base', 6, 1050.00, '4L', 'Deep Base', 130),
('Berger Rangoli Total Care', 1, 660.00, '4L', 'White', 340),
('Berger Luxol Satin Enamel', 8, 510.00, '1L', 'White', 270),
('Berger Waterproof Cement Paint', 5, 760.00, '5Kg', 'Grey', 155),
('Berger Express Dry Enamel', 8, 530.00, '1L', 'Yellow', 220);
