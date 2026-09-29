from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.orchestrator import SupplyChainAIEngine


app = FastAPI(
    title="HackFest AI Supply Chain Engine",
    description="Agentic AI engine for supply-chain disruption analysis",
    version="1.0.0"
)


class AnalyzeRequest(BaseModel):
    event_index: int = 0


@app.get("/")
def root():
    return {
        "service": "HackFest AI Supply Chain Engine",
        "status": "running",
        "agents": [
            "Sensing",
            "Impact Analysis",
            "Planning",
            "Execution Support"
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/analyze")
def analyze(request: AnalyzeRequest):

    try:
        engine = SupplyChainAIEngine()

        result = engine.analyze(
            event_index=request.event_index
        )

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )