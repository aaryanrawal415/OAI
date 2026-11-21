import itertools

class BudgetTracker:
    """Tracks budget usage for a planning scenario."""
    def __init__(self, initial_budget: float):
        self.initial_budget = initial_budget
        self.spent = 0.0

    def add_expense(self, amount: float):
        self.spent += amount
        if self.spent > self.initial_budget:
            raise ValueError("Budget exceeded")

    @property
    def remaining(self) -> float:
        return self.initial_budget - self.spent
