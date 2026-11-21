import os
import requests
from datetime import datetime
from app.schemas import UnctadDataRequest, UnctadDataResponse
from app.config import settings

UNCTAD_TOKEN_URL = "https://unctad.org/api/v1/token"
UNCTAD_DATA_URL = "https://unctad.org/api/v1/trade"

def get_access_token():
    resp = requests.post(
        UNCTAD_TOKEN_URL,
        data={"client_id": settings.UNCTAD_CLIENT_ID, "client_secret": settings.UNCTAD_CLIENT_SECRET},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

async def fetch_unctad_data(request: UnctadDataRequest, db_session):
    # Placeholder: In a real implementation, you would query the DB for cached data.
    token = get_access_token()
    params = {
        "commodity_code": request.commodity_code,
        "start_year": request.start_year,
        "end_year": request.end_year,
    }
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(UNCTAD_DATA_URL, params=params, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    return UnctadDataResponse(
        commodity_code=request.commodity_code,
        data=data,
        fetched_at=datetime.utcnow().date(),
    )
