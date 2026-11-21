import itertools
from typing import List
from app.seed_data import SeedDataGenerator

class ScenarioGenerator:
    """Generate simulation scenarios using seed data and optional variations."""
    def __init__(self, seed_count: int = 100):
        self.seed_generator = SeedDataGenerator(count=seed_count)

    def generate_scenarios(self) -> List[dict]:
        seeds = self.seed_generator.generate()
        # Placeholder: each seed becomes a scenario dict
        return [{"seed": s, "variant": "default"} for s in seeds]
