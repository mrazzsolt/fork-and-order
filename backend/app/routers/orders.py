from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.food import Food
from app.schemas.order import OrderCreate, OrderResponse
from app.services.auth_service import decode_token

router = APIRouter(prefix="/api/orders", tags=["orders"])
bearer = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> int:
    try:
        payload = decode_token(credentials.credentials)
        return int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    total = 0.0
    items = []
    for item in data.items:
        food = db.query(Food).filter(Food.id == item.food_id).first()
        if not food:
            raise HTTPException(status_code=404, detail=f"Food {item.food_id} not found")
        total += food.price * item.quantity
        items.append(OrderItem(food_id=food.id, quantity=item.quantity, unit_price=food.price))

    order = Order(user_id=user_id, total_price=total, items=items)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("/", response_model=list[OrderResponse])
async def get_orders(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return db.query(Order).filter(Order.user_id == user_id).all()