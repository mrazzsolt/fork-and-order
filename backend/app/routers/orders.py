from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.food import Food
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    total  = 0.0
    items = []
    for item in order_data.items:
        food = db.query(Food).filter(Food.id == item.food_id).first()
        if not food:
            raise HTTPException(status_code=404, detail=f"Food {item.food_id} not found")
        total += food.price * item.quantity
        items.append(OrderItem(food_id=food.id, quantity=item.quantity, unit_price=food.price))

@router.get("/", response_model=list[OrderResponse])
async def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders