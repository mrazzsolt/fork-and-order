from pydantic import BaseModel

class FoodBase(BaseModel):
    name: str
    description: str = ""
    price: float
    category: str = "main"
    image_url: str = ""
    available: bool = True

class FoodCreate(FoodBase):
    pass

class FoodResponse(FoodBase):
    id: int

    model_config = {
        "from_attributes": True
    }