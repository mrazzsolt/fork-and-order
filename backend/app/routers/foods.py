from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.food import Food
from app.schemas.food import FoodCreate, FoodResponse

router = APIRouter(prefix="/api/foods", tags=["foods"])

@router.get("/", response_model=list[FoodResponse])
async def get_foods(db: Session = Depends(get_db)):
    foods = db.query(Food).filter(Food.available == True).all()
    return foods

@router.get("/{food_id}", response_model=FoodResponse)
async def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food

@router.post("/", response_model=FoodResponse, status_code=201)
async def create_food(food: FoodCreate, db: Session = Depends(get_db)):
    db_food = Food(**food.model_dump())
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food