from typing import Dict, Any


class ExecutionSupportAgent:
    """
    Execution Support Agent

    Converts the planning result into an actionable
    recommendation for the human decision-maker.

    It does NOT execute purchases automatically.
    """

    def prepare_action(
        self,
        plan: Dict[str, Any],
        impact_result: Dict[str, Any]
    ) -> Dict[str, Any]:

        recommendation = plan["overall_recommendation"]

        # Get the recommended supplier
        supplier_id = recommendation.get("supplier_id")
        supplier_name = recommendation.get("supplier_name")
        country = recommendation.get("country")

        # Get inventory and production strategies
        inventory_strategy = plan["inventory_strategy"]
        production_strategy = plan["production_strategy"]

        # Find the matching deal opportunity
        deal_strategy = None

        for deal in plan["deal_opportunities"]:
            if deal["supplier_id"] == supplier_id:
                deal_strategy = deal
                break

        # Prepare manager action package
        action = {
            "status": "PENDING_APPROVAL",

            "product": {
                "id": impact_result["product_id"],
                "name": impact_result["product_name"]
            },

            "recommended_supplier": {
                "supplier_id": supplier_id,
                "supplier_name": supplier_name,
                "country": country
            },

            "reason": recommendation["reason"],

            "financial_impact": impact_result[
                "financial_impact"
            ],

            "inventory_action": inventory_strategy,

            "production_action": production_strategy,

            "deal_strategy": deal_strategy,

            "approval": {
                "required": True,
                "approved": False,
                "approved_by": None
            }
        }

        return action