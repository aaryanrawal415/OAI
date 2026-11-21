import requests
from app.config import settings
from app.schemas import UnctadDataRequest

class UNCTADPublicAPI:
    """Adapter to fetch data directly from UNCTAD public API."""
    TOKEN_URL = "https://unctad.org/api/v1/token"
    DATA_URL = "https://unctad.org/api/v1/trade"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self._access_token = None

    def _ensure_token(self):
        if not self._access_token:
            resp = self.session.post(self.TOKEN_URL, json={
                "client_id": settings.UNCTAD_CLIENT_ID,
                "client_secret": settings.UNCTAD_CLIENT_SECRET,
            })
            resp.raise_for_status()
            self._access_token = resp.json()["access_token"]
            self.session.headers.update({"Authorization": f"Bearer {self._access_token}"})

    def fetch(self, request: UnctadDataRequest):
        self._ensure_token()
        params = {
            "commodity_code": request.commodity_code,
            "start_year": request.start_year,
            "end_year": request.end_year,
        }
        resp = self.session.get(self.DATA_URL, params=params)
        resp.raise_for_status()
        return resp.json()
