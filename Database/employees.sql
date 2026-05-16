USE berger_paints;
-- TABLE 5: EMPLOYEES

CREATE TABLE employees (
  employee_id INT PRIMARY KEY AUTO_INCREMENT,
  employee_name VARCHAR(150),
  department VARCHAR(100),
  designation VARCHAR(100),
  region_id INT,
  salary DECIMAL(10,2),
  join_date DATE,
  FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

INSERT INTO employees (employee_name, department, designation, region_id, salary, join_date) VALUES
('Amit Sharma', 'Sales', 'Sales Executive', 1, 32000.00, '2021-06-01'),
('Priya Das', 'IT', 'IT Executive', 1, 38000.00, '2022-01-15'),
('Rohit Verma', 'Sales', 'Area Manager', 3, 55000.00, '2019-03-10'),
('Sneha Iyer', 'Marketing', 'Marketing Executive', 4, 36000.00, '2021-09-01'),
('Karthik Nair', 'Logistics', 'Logistics Coordinator', 5, 30000.00, '2020-07-20'),
('Meena Pillai', 'Finance', 'Accounts Executive', 2, 42000.00, '2018-11-05'),
('Suresh Kumar', 'Sales', 'Sales Executive', 6, 31000.00, '2022-04-01'),
('Ananya Roy', 'IT', 'Data Analyst', 1, 45000.00, '2021-02-14'),
('Vikas Gupta', 'Sales', 'Regional Manager', 2, 75000.00, '2016-08-01'),
('Pooja Singh', 'HR', 'HR Executive', 3, 34000.00, '2020-12-01'),
('Deepak Rao', 'Logistics', 'Warehouse Manager', 7, 48000.00, '2017-05-15'),
('Rina Banerjee', 'Finance', 'Finance Manager', 1, 68000.00, '2015-03-20'),
('Manoj Tiwari', 'Marketing', 'Brand Manager', 3, 62000.00, '2018-09-10'),
('Divya Menon', 'IT', 'System Administrator', 4, 41000.00, '2022-06-01'),
('Arjun Malhotra', 'Sales', 'Sales Executive', 8, 33000.00, '2023-01-10');