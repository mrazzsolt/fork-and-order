from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.food import Food
from app.schemas.food import FoodCreate, FoodResponse
from app.services.auth_service import decode_token
from pydantic import BaseModel
from typing import Optional
from app.models.order import Order, OrderItem
from app.schemas.order import OrderResponse
from app.routers.orders import serialize_order
from sqlalchemy.orm import Session, joinedload
from app.schemas.order import OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])
bearer = HTTPBearer()

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_admin: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str = ""
    is_admin: bool = False
    model_config = {"from_attributes": True}

def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user or not user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Foods ---
@router.get("/foods", response_model=list[FoodResponse])
async def admin_list_foods(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(Food).all()

@router.post("/foods", response_model=FoodResponse, status_code=201)
async def admin_add_food(data: FoodCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    food = Food(**data.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food

@router.patch("/foods/{food_id}", response_model=FoodResponse)
async def admin_update_food(food_id: int, data: FoodCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    for key, value in data.model_dump().items():
        setattr(food, key, value)
    db.commit()
    db.refresh(food)
    return food

@router.delete("/foods/{food_id}", status_code=204)
async def admin_delete_food(food_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(food)
    db.commit()

# --- Users ---
@router.get("/users", response_model=list[UserResponse])
async def admin_list_users(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(User).all()

@router.patch("/users/{user_id}", response_model=UserResponse)
async def admin_update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=204)
async def admin_delete_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_admin_user)):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()

# --- Orders ---
@router.get("/orders", response_model=list[OrderResponse])
async def admin_list_orders(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    orders = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.food)
    ).order_by(Order.created_at.desc()).all()
    return [serialize_order(o) for o in orders]

@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def admin_update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = body.status
    print(f"[DEBUG] Setting order {order_id} status to: {body.status}")
    db.commit()
    print(f"[DEBUG] After commit, status in memory: {order.status}")
    db.refresh(order)

    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.food)
    ).filter(Order.id == order_id).first()

    return serialize_order(order)