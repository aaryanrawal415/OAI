# Synthetic data source for OptiFreight

import random
from datetime import datetime, timedelta

class SyntheticSource:
    """Generate synthetic freight data for testing and simulation."""
    def __init__(self, num_records: int = 100):
        self.num_records = num_records

    def generate(self):
        data = []
        for _ in range(self.num_records):
            record = {
                "commodity_code": f"{random.randint(1000, 9999)}",
                "weight_kg": random.uniform(500, 5000),
                "origin": "LocationA",
                "destination": "LocationB",
                "date": (datetime.utcnow() - timedelta(days=random.randint(0, 30))).date().isoformat(),
            }
            data.append(record)
        return data
