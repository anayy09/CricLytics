from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import data, teams, players, matches, predictions
from app.core.config import settings

app = FastAPI(
    title="IPL 2025 Analytics API",
    description="Backend API for IPL 2025 Cricket Analytics Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data.router, prefix=f"{settings.API_PREFIX}/data", tags=["Data Management"])
app.include_router(teams.router, prefix=f"{settings.API_PREFIX}/teams", tags=["Teams"])
app.include_router(players.router, prefix=f"{settings.API_PREFIX}/players", tags=["Players"])
app.include_router(matches.router, prefix=f"{settings.API_PREFIX}/matches", tags=["Matches"])
app.include_router(predictions.router, prefix=f"{settings.API_PREFIX}/predictions", tags=["Predictions"])

@app.get("/")
async def root():
    return {"message": "Welcome to IPL 2025 Analytics API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)