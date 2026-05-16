USE berger_paints;
-- TABLE 4: CUSTOMERS

CREATE TABLE customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(150),
  customer_type ENUM('Retailer', 'Dealer', 'Contractor', 'Direct'),
  region_id INT,
  phone VARCHAR(15),
  email VARCHAR(100),
  FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

INSERT INTO customers (customer_name, customer_type, region_id, phone, email) VALUES
('Ravi Paint House', 'Retailer', 1, '9800011111', 'ravi@painthouse.com'),
('Mumbai Colour World', 'Dealer', 2, '9800022222', 'info@colourworld.com'),
('Delhi Decor Supplies', 'Dealer', 3, '9800033333', 'delhi@decor.com'),
('Chennai Build Mart', 'Retailer', 4, '9800044444', 'chennai@buildmart.com'),
('Ramesh Contractors', 'Contractor', 5, '9800055555', 'ramesh@contractors.com'),
('Kolkata Home Needs', 'Retailer', 1, '9800066666', 'kolkata@homeneed.com'),
('Pune Paint Gallery', 'Dealer', 7, '9800077777', 'pune@paintgallery.com'),
('Ahmedabad Paints Co', 'Dealer', 8, '9800088888', 'ahd@paintsco.com'),
('Lucknow Interiors', 'Contractor', 9, '9800099999', 'lko@interiors.com'),
('Sharma Building Works', 'Contractor', 3, '9800010101', 'sharma@building.com'),
('Star Decorators', 'Contractor', 2, '9800010102', 'star@decorators.com'),
('Quick Fix Painters', 'Contractor', 6, '9800010103', 'quickfix@painters.com'),
('Bhubaneswar Trade', 'Retailer', 10, '9800010104', 'bbsr@trade.com'),
('Hyderabad Home Depot', 'Retailer', 6, '9800010105', 'hyd@homedepot.com'),
('Green Build Solutions', 'Contractor', 5, '9800010106', 'green@buildsol.com');