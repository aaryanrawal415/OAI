import random
from datetime import datetime, timedelta
from app.schemas import UnctadDataRequest

class SeedDataGenerator:
    """Generate seed data for simulation runs."""
    def __init__(self, count: int = 100):
        self.count = count

    def generate(self):
        data = []
        for _ in range(self.count):
            request = UnctadDataRequest(
                commodity_code=str(random.randint(1000, 9999)),
                start_year=random.randint(2010, 2020),
                end_year=random.randint(2021, 2023),
            )
            data.append(request)
        return data
