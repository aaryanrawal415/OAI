class NetContributionCalculator:
    """Calculate net contribution (revenue - incremental costs)."""
    def __init__(self, revenue: float, incremental_costs: float):
        self.revenue = revenue
        self.incremental_costs = incremental_costs

    def net(self) -> float:
        return self.revenue - self.incremental_costs
