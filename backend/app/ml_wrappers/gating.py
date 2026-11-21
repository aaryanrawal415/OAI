import random
from typing import Any

class Gating:
    """Apply deterministic rule gating before ML scores are considered."""
    def __init__(self, rules: list):
        self.rules = rules

    def is_allowed(self, candidate: dict) -> bool:
        # Placeholder: all candidates allowed if they have 'eligible' flag True
        return candidate.get('eligible', True)
