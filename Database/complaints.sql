USE berger_paints;
-- TABLE 8: COMPLAINTS

CREATE TABLE complaints (
  complaint_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  product_id INT,
  complaint_text TEXT,
  status ENUM('Open', 'Resolved', 'In Progress'),
  complaint_date DATE,
  resolved_date DATE,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO complaints (customer_id, product_id, complaint_text, status, complaint_date, resolved_date) VALUES
(1, 1, 'Paint peeling after 2 weeks', 'Resolved', '2024-02-10', '2024-02-18'),
(3, 5, 'Color shade different from sample', 'Resolved', '2024-02-15', '2024-02-22'),
(5, 3, 'Quantity less than mentioned', 'Resolved', '2024-03-01', '2024-03-05'),
(7, 10, 'Primer not adhering well on metal', 'In Progress', '2024-04-10', NULL),
(9, 4, 'Packaging damaged on delivery', 'Open', '2024-04-20', NULL),
(11, 8, 'Color fading quickly', 'In Progress', '2024-05-01', NULL),
(13, 15, 'Putty hardening too fast', 'Resolved', '2024-03-15', '2024-03-20'),
(2, 7, 'Finish not smooth as expected', 'Open', '2024-05-10', NULL),
(4, 2, 'Strong odor even after drying', 'Resolved', '2024-03-20', '2024-03-28'),
(6, 11, 'Waterproofing not effective', 'In Progress', '2024-04-25', NULL);