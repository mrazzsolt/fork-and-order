-- Fork & Order – Database initialization script

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price REAL NOT NULL,
    category TEXT DEFAULT 'main',
    image_url TEXT DEFAULT '',
    available INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    total_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (food_id) REFERENCES foods(id)
);

-- Sample data
INSERT INTO foods (name, description, price, category, available) VALUES
    ('Margherita Pizza', 'Classic tomato sauce with mozzarella', 2500, 'pizza', 1),
    ('Pepperoni Pizza', 'Spicy pepperoni with mozzarella', 2900, 'pizza', 1),
    ('Caesar Salad', 'Romaine lettuce, croutons, parmesan', 1800, 'salad', 1),
    ('Cheeseburger', 'Beef patty with cheddar and pickles', 2200, 'burger', 1),
    ('Veggie Burger', 'Plant-based patty with fresh veggies', 2000, 'burger', 1),
    ('Pasta Carbonara', 'Creamy egg sauce with pancetta', 2400, 'pasta', 1),
    ('Tiramisu', 'Classic Italian dessert', 1200, 'dessert', 1),
    ('Coca-Cola', 'Ice cold 0.33L', 600, 'drink', 1);