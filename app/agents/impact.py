from typing import Dict, Any


class ImpactAnalysisAgent:
    """
    Impact Analysis Agent

    Calculates the operational and financial impact
    of a detected supply-chain disruption.
    """

    def analyze(
        self,
        sensing_result: Dict[str, Any],
        product: Dict[str, Any],
        supplier: Dict[str, Any],
        inventory: Dict[str, Any]
    ) -> Dict[str, Any]:

        old_tariff = sensing_result["old_tariff"]
        new_tariff = sensing_result["new_tariff"]

        unit_price = supplier["unit_price"]
        quantity = inventory["quantity"]
        daily_demand = product["daily_demand"]

        # Tariff increase as a percentage point change
        tariff_change = new_tariff - old_tariff

        # Estimated additional tariff cost per unit
        additional_cost_per_unit = (
            unit_price * tariff_change / 100
        )

        # New estimated landed cost
        new_landed_cost = (
            unit_price * (1 + new_tariff / 100)
        )

        # Estimated additional cost for current inventory
        estimated_inventory_cost_impact = (
            quantity * additional_cost_per_unit
        )

        # How many days current inventory can support demand
        inventory_days = quantity / daily_demand

        # Production risk
        if inventory_days < 5:
            production_risk = "CRITICAL"
        elif inventory_days < 10:
            production_risk = "HIGH"
        elif inventory_days < 20:
            production_risk = "MEDIUM"
        else:
            production_risk = "LOW"

        return {
            "product_id": product["id"],
            "product_name": product["name"],
            "supplier_id": supplier["id"],
            "supplier_country": supplier["country"],

            "tariff": {
                "old": old_tariff,
                "new": new_tariff,
                "change": tariff_change
            },

            "financial_impact": {
                "original_unit_price": unit_price,
                "additional_cost_per_unit": round(
                    additional_cost_per_unit, 2
                ),
                "new_landed_cost": round(
                    new_landed_cost, 2
                ),
                "estimated_inventory_cost_impact": round(
                    estimated_inventory_cost_impact, 2
                )
            },

            "inventory_impact": {
                "current_quantity": quantity,
                "daily_demand": daily_demand,
                "inventory_days": round(
                    inventory_days, 2
                )
            },

            "risk": {
                "production_risk": production_risk,
                "event_severity": sensing_result["severity"]
            },

            "summary": (
                f"Tariff increased by {tariff_change} percentage points. "
                f"Estimated landed cost is "
                f"{new_landed_cost:.2f} per unit. "
                f"Current inventory covers approximately "
                f"{inventory_days:.2f} days of demand."
            )
        }