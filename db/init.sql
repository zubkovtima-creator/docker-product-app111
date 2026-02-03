CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, price) VALUES 
    ('Ноутбук Dell XPS 13', 1299.99),
    ('Смартфон iPhone 15 Pro', 999.00),
    ('Навушники Sony WH-1000XM5', 349.99),
    ('Монітор Samsung 32" 4K', 499.50),
    ('Клавіатура Logitech MX Keys', 99.99),
    ('Миша Logitech MX Master 3S', 79.99),
    ('Планшет iPad Air', 749.00),
    ('Фотоапарат Sony A7 IV', 2499.00),
    ('Принтер HP LaserJet', 299.00),
    ('Жорсткий диск SSD 1TB', 89.99)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

SELECT 'База данных успешно инициализирована!' as message;
SELECT COUNT(*) as total_products FROM products;