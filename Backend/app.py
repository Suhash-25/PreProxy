from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from shadow_env import run_shadow_analysis

app = FastAPI(title="PreProxy POSSE Engine")

class InterceptRequest(BaseModel):
    url: str
    context: str = "click"

@app.post("/analyze")
async def analyze_url(request: InterceptRequest):
    # 1. Trigger Shadow Execution [cite: 133]
    raw_results = await run_shadow_analysis(request.url)
    
    # 2. Decision Logic (Proof-of-Safety Scoring) [cite: 106, 137]
    verdict = "ALLOW"
    if raw_results["score"] < 70:
        verdict = "BLOCK"
    elif "Redirected" in str(raw_results["anomalies"]):
        verdict = "ISOLATE" # Open in restricted mode [cite: 115]

    return {
        "url": request.url,
        "verdict": verdict,
        "score": raw_results["score"],
        "details": raw_results["anomalies"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)