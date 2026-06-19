-- Pop-Tarts Nutrition Facts - per 1 pastry
-- Sources: CalorieKing, MyFoodDiary, USDA (June 2026)

INSERT INTO custom_foods (name, portion, calories, protein, carbs, fat, source) VALUES
-- Frosted Classics
('Pop-Tarts Frosted Strawberry', '1 pastry (48g)', 190, 2, 36, 5, 'CalorieKing / MyFoodDiary 2026'),
('Pop-Tarts Frosted Blueberry', '1 pastry (48g)', 190, 2, 36, 5, 'CalorieKing 2026'),
('Pop-Tarts Frosted Cherry', '1 pastry (48g)', 190, 2, 36, 5, 'CalorieKing 2026'),
('Pop-Tarts Frosted Brown Sugar Cinnamon', '1 pastry (50g)', 210, 2, 35, 7, 'CalorieKing 2026'),
('Pop-Tarts Frosted Apple Cinnamon', '1 pastry (48g)', 195, 2, 37, 5, 'CalorieKing 2026'),
('Pop-Tarts Frosted Wild Berry', '1 pastry (52g)', 203, 2, 38, 5, 'USDA / EatThisMuch 2026'),

-- Chocolate / Dessert
('Pop-Tarts Frosted Chocolate Fudge', '1 pastry (52g)', 200, 3, 37, 5, 'CalorieKing 2026'),
('Pop-Tarts Frosted S''mores', '1 pastry (52g)', 200, 3, 36, 5, 'CalorieKing 2026'),
('Pop-Tarts Frosted Hot Fudge Sundae', '1 pastry (48g)', 190, 2, 35, 5, 'CalorieKing 2026'),
('Pop-Tarts Frosted Cookies & Creme', '1 pastry (52g)', 190, 2, 35, 5, 'CalorieKing 2026'),
('Pop-Tarts Frosted Chocolate Chip', '1 pastry (52g)', 200, 2, 37, 5, 'CalorieKing 2026'),

-- Unfrosted
('Pop-Tarts Unfrosted Strawberry', '1 pastry (48g)', 190, 2, 36, 5, 'MyFoodDiary 2026'),
('Pop-Tarts Unfrosted Blueberry', '1 pastry (48g)', 185, 2, 35, 5, 'CalorieKing 2026'),
('Pop-Tarts Unfrosted Brown Sugar Cinnamon', '1 pastry (50g)', 200, 2, 34, 6, 'CalorieKing 2026');
