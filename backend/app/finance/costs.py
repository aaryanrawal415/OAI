import itertools
from decimal import Decimal

class CostCalculator:
    """Calculate various cost components for a freight job."""
    def __init__(self, distance_km: float, weight_kg: float, fuel_price: Decimal = Decimal('1.0')):
        self.distance_km = distance_km
        self.weight_kg = weight_kg
        self.fuel_price = fuel_price

    def fuel_cost(self) -> Decimal:
        # Simplified fuel consumption: 0.3 L per km per ton
        consumption = Decimal('0.3') * Decimal(self.distance_km) * Decimal(self.weight_kg) / Decimal('1000')
        return consumption * self.fuel_price

    def toll_cost(self) -> Decimal:
        # Placeholder flat toll per 100 km
        return Decimal(self.distance_km / 100 * 5)

    def total(self) -> Decimal:
        return self.fuel_cost() + self.toll_cost()
