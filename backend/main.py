import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, test_connection
from routes.scan import router as scan_router
from routes.remediate import router as remediate_router
from routes.pullrequest import router as pr_router
from routes.intent import router as intent_router
from routes.risk import router as risk_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Apex Security API",
    description="Plataforma ASPM — Apex Security v1.0",
    version="1.0.0"
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router, prefix="/api", tags=["scan"])
app.include_router(remediate_router, prefix="/api", tags=["remediation"])
app.include_router(pr_router, prefix="/api", tags=["pull-requests"])
app.include_router(intent_router, prefix="/api", tags=["intent"])
app.include_router(risk_router, prefix="/api", tags=["risk"])


@app.on_event("startup")
async def startup_event():
    test_connection()


@app.get("/")
def root():
    return {
        "service": "Apex Security API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Apex Security API v1.0"}
