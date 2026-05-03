from pydantic import BaseModel
from datetime import datetime

class OrderItemCreate(BaseModel):
    food_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    food_id: int
    food_name: str = ""
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}

class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_price: float
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str