import random
from typing import Any

class ModelC:
    """Placeholder ML model C for ranking freight options."""
    def predict(self, features: dict) -> float:
        # Dummy score based on distance
        return features.get('distance_km', 0) / 1000.0
