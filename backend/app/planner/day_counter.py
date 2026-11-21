import itertools
from datetime import datetime, timedelta

class DayCounter:
    """Utility for counting days within planning windows."""
    def __init__(self, start_date: datetime, end_date: datetime):
        self.start_date = start_date
        self.end_date = end_date

    def days(self) -> int:
        return (self.end_date - self.start_date).days + 1
