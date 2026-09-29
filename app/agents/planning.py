from typing import Dict, Any, List


class PlanningAgent:
    """
    Planning Agent

    Generates alternative supply-chain strategies based on
    the disruption and its calculated business impact.
    """

    def generate_plan(
        self,
        impact_result: Dict[str, Any],
        suppliers: List[Dict[str, Any]],
        product: Dict[str, Any]
    ) -> Dict[str, Any]:

        current_supplier_id = impact_result["supplier_id"]
        current_tariff = impact_result["tariff"]["new"]
        daily_demand = product["daily_demand"]

        alternatives = []

        # -------------------------------------------------
        # 1. Evaluate alternative suppliers
        # -------------------------------------------------

        for supplier in suppliers:

            # Skip the currently affected supplier
            if supplier["id"] == current_supplier_id:
                continue

            # Demo assumption:
            # alternative suppliers are outside the affected
            # tariff route, so their tariff exposure is 0%.
            alternative_tariff = 0

            unit_price = supplier["unit_price"]

            landed_cost = unit_price * (
                1 + alternative_tariff / 100
            )

            current_landed_cost = impact_result[
                "financial_impact"
            ]["new_landed_cost"]

            cost_difference = current_landed_cost - landed_cost

            # Calculate how many days the supplier's
            # available capacity could support demand.
            capacity_days = (
                supplier["capacity"] / daily_demand
            )

            # Basic supplier evaluation
            if supplier["risk"] == "LOW" and supplier["lead_time_days"] <= 5:
                recommendation_level = "STRONG"
            elif supplier["risk"] == "LOW":
                recommendation_level = "MODERATE"
            else:
                recommendation_level = "WEAK"

            alternatives.append({
                "supplier_id": supplier["id"],
                "supplier_name": supplier["name"],
                "country": supplier["country"],
                "unit_price": unit_price,
                "tariff": alternative_tariff,
                "estimated_landed_cost": round(
                    landed_cost, 2
                ),
                "cost_difference_per_unit": round(
                    cost_difference, 2
                ),
                "lead_time_days": supplier["lead_time_days"],
                "capacity": supplier["capacity"],
                "capacity_days": round(
                    capacity_days, 2
                ),
                "risk": supplier["risk"],
                "recommendation_level": recommendation_level
            })

        # -------------------------------------------------
        # 2. Rank alternatives
        # -------------------------------------------------

        alternatives.sort(
            key=lambda x: (
                x["estimated_landed_cost"],
                x["lead_time_days"]
            )
        )

        # -------------------------------------------------
        # 3. Inventory strategy
        # -------------------------------------------------

        inventory_days = impact_result[
            "inventory_impact"
        ]["inventory_days"]

        if inventory_days < 10:
            inventory_strategy = {
                "action": "Increase safety stock",
                "reason": (
                    "Current inventory covers less than "
                    "10 days of demand."
                ),
                "priority": "HIGH"
            }
        else:
            inventory_strategy = {
                "action": "Maintain current inventory",
                "reason": "Inventory coverage is adequate.",
                "priority": "MEDIUM"
            }

        # -------------------------------------------------
        # 4. Production strategy
        # -------------------------------------------------

        if inventory_days < 10:
            production_strategy = {
                "action": "Prioritize critical production",
                "reason": (
                    "Inventory coverage is limited and "
                    "supply disruption risk is HIGH."
                )
            }
        else:
            production_strategy = {
                "action": "Continue normal production",
                "reason": "Inventory coverage is adequate."
            }

        # -------------------------------------------------
        # 5. Deal / negotiation strategy
        # -------------------------------------------------

        deal_opportunities = []

        for alternative in alternatives:

            target_price = round(
                alternative["unit_price"] * 0.97,
                2
            )

            deal_opportunities.append({
                "supplier_id": alternative["supplier_id"],
                "supplier_name": alternative["supplier_name"],
                "strategy": "Volume discount negotiation",
                "target_price": target_price,
                "suggested_action": (
                    "Request a volume-based price reduction "
                    "and priority delivery."
                ),
                "negotiation_points": [
                    "Volume commitment",
                    "Priority delivery",
                    "Long-term supply agreement",
                    "Payment terms"
                ]
            })

        # -------------------------------------------------
        # 6. Overall recommendation
        # -------------------------------------------------

        if alternatives:
            best = alternatives[0]

            overall_recommendation = {
                "action": "Evaluate alternative supplier",
                "supplier_id": best["supplier_id"],
                "supplier_name": best["supplier_name"],
                "country": best["country"],
                "reason": (
                    f"Estimated landed cost is "
                    f"{best['estimated_landed_cost']:.2f} "
                    f"with {best['lead_time_days']} days "
                    f"lead time and {best['risk']} risk."
                ),
                "requires_human_approval": True
            }
        else:
            overall_recommendation = {
                "action": "No alternative supplier available",
                "reason": (
                    "Continue monitoring the affected supplier "
                    "and consider inventory protection."
                ),
                "requires_human_approval": True
            }

        return {
            "product_id": product["id"],
            "supplier_alternatives": alternatives,
            "inventory_strategy": inventory_strategy,
            "production_strategy": production_strategy,
            "deal_opportunities": deal_opportunities,
            "overall_recommendation": overall_recommendation
        }