import requests
from app.config import settings

class RoutingClient:
    """Simple HTTP client to interact with external routing services."""
    def __init__(self, base_url: str = "https://routing.example.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {settings.UNCTAD_CLIENT_SECRET}"})

    def get_route(self, origin: str, destination: str):
        resp = self.session.get(f"{self.base_url}/route", params={"origin": origin, "destination": destination})
        resp.raise_for_status()
        return resp.json()
