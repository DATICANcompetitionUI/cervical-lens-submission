"""
CervicalLens inference microservice (FastAPI).
==============================================
Thin HTTP layer over models/inference.py so the platform (web/mobile/api,
TypeScript) can call the Python models over the network.

Run:
  cd models
  uv run --with fastapi --with uvicorn --with onnxruntime --with pillow \
         --with scikit-learn --with lifelines --with pandas --with joblib \
         uvicorn serve:app --port 8000
Or: pip install -r requirements.txt && uvicorn serve:app --port 8000

Endpoints:
  GET  /health
  POST /predict/cytology   (multipart file="image")            -> screening
  POST /predict/genomics   (JSON body: {features: {..}})       -> risk category
  POST /predict            (JSON: {features} and/or image ref) -> both
"""
from __future__ import annotations

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import io

from inference import CervicalLens

app = FastAPI(title="CervicalLens Inference", version="1.0")
_model: CervicalLens | None = None


def model() -> CervicalLens:
    global _model
    if _model is None:
        _model = CervicalLens()
    return _model


class GenomicsRequest(BaseModel):
    features: dict[str, float]


@app.get("/health")
def health():
    m = model()
    return {
        "status": "ok",
        "imaging_model": "cervicallens_edge (ONNX)",
        "genomics_cindex": m._gen_meta["cv_cindex_combined"],
    }


@app.post("/predict/cytology")
async def predict_cytology(image: UploadFile = File(...)):
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(await image.read()))
        return model().predict_cytology(img)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"cytology inference failed: {e}")


@app.post("/predict/genomics")
def predict_genomics(req: GenomicsRequest):
    try:
        return model().predict_genomics(req.features)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"genomics inference failed: {e}")
