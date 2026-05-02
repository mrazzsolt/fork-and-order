from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.food import Food
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse
from app.services.auth_service import decode_token

router = APIRouter(prefix="/api/orders", tags=["orders"])
bearer = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> int:
    try:
        payload = decode_token(credentials.credentials)
        return int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def serialize_order(order: Order) -> OrderResponse:
    items = []
    for item in order.items:
        items.append(OrderItemResponse(
            id=item.id,
            food_id=item.food_id,
            food_name=item.food.name if item.food else f"Food #{item.food_id}",
            quantity=item.quantity,
            unit_price=item.unit_price
        ))
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        total_price=order.total_price,
        created_at=order.created_at,
        items=items
    )

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
    order = db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.food)).filter(Order.id == order.id).first()
    return serialize_order(order)

@router.get("/", response_model=list[OrderResponse])
async def get_orders(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    orders = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.food)
    ).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    return [serialize_order(o) for o in orders]