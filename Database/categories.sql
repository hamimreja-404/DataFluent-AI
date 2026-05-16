USE berger_paints;

-- TABLE 2: CATEGORIES

CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100),
  description TEXT
);

INSERT INTO categories (category_name, description) VALUES
('Interior Wall Paint', 'Paints for indoor walls and ceilings'),
('Exterior Wall Paint', 'Weather-resistant outdoor paints'),
('Wood Finish', 'Paints and varnishes for wood surfaces'),
('Metal Primer', 'Primers and paints for metal surfaces'),
('Waterproofing', 'Waterproof coatings for roofs and walls'),
('Luxury Emulsion', 'Premium smooth finish interior paints'),
('Distemper', 'Economy range wall finish'),
('Enamel Paint', 'Hard gloss finish for wood and metal'),
('Texture Coat', 'Decorative textured wall finish'),
('Putty', 'Wall putty for surface preparation');
