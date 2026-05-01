from pydantic import BaseModel
from datetime import datetime

class OrderItemCreate(BaseModel):
    food_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]

class OrderItemResponse(BaseModel):
    food_id: int
    quantity: int
    unit_price: float

    model_config = {
        "from_attributes": True
    }

class OrderResponse(BaseModel):
    food_id: int
    quantity: int
    unit_price: float

    model_config = {
        "from_attributes": True
    }

class OrderReponse(BaseModel):
    id: int
    status: str
    total_price: float
    created_at: datetime
    items: list[OrderItemResponse]

    model_config = {
        "from_attributes": True
    }