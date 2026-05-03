from app.database import engine, Base
from app.models.food import Food
from app.models.user import User
from app.models.order import Order, OrderItem
from app.services.auth_service import hash_password
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

with Session(engine) as db:
    # Foods
    if db.query(Food).count() == 0:
        foods = [
            Food(name='Margherita Pizza', description='Classic tomato sauce with mozzarella', price=2500, category='pizza'),
            Food(name='Pepperoni Pizza', description='Spicy pepperoni with mozzarella', price=2900, category='pizza'),
            Food(name='Caesar Salad', description='Romaine lettuce, croutons, parmesan', price=1800, category='salad'),
            Food(name='Cheeseburger', description='Beef patty with cheddar and pickles', price=2200, category='burger'),
            Food(name='Pasta Carbonara', description='Creamy egg sauce with pancetta', price=2400, category='pasta'),
            Food(name='Tiramisu', description='Classic Italian dessert', price=1200, category='dessert'),
            Food(name='Coca-Cola', description='Ice cold 0.33L', price=600, category='drink'),
        ]
        db.add_all(foods)
        db.commit()
        print('Sample foods inserted!')
    else:
        print('Foods already exist, skipping.')

    # Admin user
    if not db.query(User).filter(User.email == 'admin@forkandorder.com').first():
        admin = User(
            email='admin@forkandorder.com',
            username='admin',
            hashed_password=hash_password('admin123'),
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print('Admin user created: admin@forkandorder.com / admin123')
    else:
        print('Admin already exists, skipping.')

    # Test user
    if not db.query(User).filter(User.email == 'test@forkandorder.com').first():
        test_user = User(
            email='test@forkandorder.com',
            username='testuser',
            hashed_password=hash_password('test123'),
            is_admin=False
        )
        db.add(test_user)
        db.commit()
        print('Test user created: test@forkandorder.com / test123')
    else:
        print('Test user already exists, skipping.')

    # Test orders
    test_user = db.query(User).filter(User.email == 'test@forkandorder.com').first()
    if db.query(Order).filter(Order.user_id == test_user.id).count() == 0:
        pizza = db.query(Food).filter(Food.name == 'Margherita Pizza').first()
        burger = db.query(Food).filter(Food.name == 'Cheeseburger').first()
        cola = db.query(Food).filter(Food.name == 'Coca-Cola').first()
        pasta = db.query(Food).filter(Food.name == 'Pasta Carbonara').first()

        # Pending order
        pending_order = Order(
            user_id=test_user.id,
            status='pending',
            total_price=pizza.price * 2 + cola.price
        )
        db.add(pending_order)
        db.commit()
        db.add_all([
            OrderItem(order_id=pending_order.id, food_id=pizza.id, quantity=2, unit_price=pizza.price),
            OrderItem(order_id=pending_order.id, food_id=cola.id,  quantity=1, unit_price=cola.price),
        ])

        # Delivered order
        delivered_order = Order(
            user_id=test_user.id,
            status='delivered',
            total_price=burger.price + pasta.price
        )
        db.add(delivered_order)
        db.commit()
        db.add_all([
            OrderItem(order_id=delivered_order.id, food_id=burger.id, quantity=1, unit_price=burger.price),
            OrderItem(order_id=delivered_order.id, food_id=pasta.id,  quantity=1, unit_price=pasta.price),
        ])

        db.commit()
        print('Test orders created: 1x pending, 1x delivered')
    else:
        print('Test orders already exist, skipping.')