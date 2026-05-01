from app.database import engine, Base
from app.models.food import Food
from app.models.user import User
from app.models.order import Order, OrderItem
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

with Session(engine) as db:
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