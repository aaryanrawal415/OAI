import random
from typing import Any

class ModelB:
    """Placeholder ML model B for ranking freight options."""
    def predict(self, features: dict) -> float:
        # Dummy deterministic score based on weight
        return features.get('weight_kg', 0) / 10000.0
