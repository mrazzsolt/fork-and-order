from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    price = Column(Float, nullable=False)
    category = Column(String, default="main")
    image_url = Column(String, default="")
    available = Column(Boolean, default=True)