from typing import Dict, Any


class SensingAgent:
    """
    Sensing Agent

    Responsibility:
    - Detect supply-chain disruptions
    - Classify the disruption
    - Calculate basic change information
    - Produce structured output for the Impact Agent
    """

    def analyze_event(
        self,
        event: Dict[str, Any],
        tariff_data: list[Dict[str, Any]]
    ) -> Dict[str, Any]:

        event_type = event.get("event_type")
        product_id = event.get("product_id")

        # Find tariff information for this product
        tariff = next(
            (
                item for item in tariff_data
                if item.get("product_id") == product_id
            ),
            None
        )

        if event_type == "TARIFF_CHANGE":

            if not tariff:
                return {
                    "detected": False,
                    "message": "Tariff information not found",
                    "event": event
                }

            old_tariff = tariff["old_tariff"]
            new_tariff = tariff["new_tariff"]

            change = new_tariff - old_tariff

            # Severity classification
            if change >= 10:
                severity = "HIGH"
            elif change >= 5:
                severity = "MEDIUM"
            else:
                severity = "LOW"

            return {
                "detected": True,
                "event_type": "TARIFF_CHANGE",
                "product_id": product_id,
                "origin": event.get("origin"),
                "destination": event.get("destination"),
                "old_tariff": old_tariff,
                "new_tariff": new_tariff,
                "tariff_change": change,
                "severity": severity,
                "message": (
                    f"Tariff increased from {old_tariff}% "
                    f"to {new_tariff}%"
                )
            }

        # Handle unsupported event types
        return {
            "detected": False,
            "event_type": event_type,
            "product_id": product_id,
            "severity": "UNKNOWN",
            "message": "Event type not yet supported"
        }