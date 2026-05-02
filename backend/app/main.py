from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import foods, auth, orders

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fork & Order API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # ← Docker-ben egyszerűbb így
    allow_credentials=False,    # ← credentials=False ha origins="*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(foods.router)
app.include_router(auth.router)
app.include_router(orders.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}