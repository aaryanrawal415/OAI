import requests
from app.routing_adapters.client import RoutingClient

class RoutingFallback:
    """Fallback mechanism when primary routing service fails."""
    def __init__(self):
        self.client = RoutingClient()

    def get_route(self, origin: str, destination: str):
        try:
            return self.client.get_route(origin, destination)
        except Exception:
            # Simple static fallback: straight line distance placeholder
            return {"distance_km": 0, "duration_min": 0, "fallback": True}
