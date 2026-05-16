USE berger_paints;
-- TABLE 1: REGIONS
CREATE TABLE regions (
  region_id INT PRIMARY KEY AUTO_INCREMENT,
  region_name VARCHAR(100),
  zone VARCHAR(50)
);

INSERT INTO regions (region_name, zone) VALUES
('Kolkata', 'East'),
('Mumbai', 'West'),
('Delhi', 'North'),
('Chennai', 'South'),
('Bangalore', 'South'),
('Hyderabad', 'South'),
('Pune', 'West'),
('Ahmedabad', 'West'),
('Lucknow', 'North'),
('Bhubaneswar', 'East');