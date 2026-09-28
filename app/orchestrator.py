
import json

from app.agents.sensing import SensingAgent
from app.agents.impact import ImpactAnalysisAgent
from app.agents.planning import PlanningAgent
from app.agents.execution import ExecutionSupportAgent
from app.services.llm import get_llm_service


class SupplyChainAIEngine:
    """
    Main orchestrator for the AI Agents Engine.

    Flow:
    Event
      -> Sensing
      -> Impact
      -> Planning
      -> LLM Analysis
      -> Execution Support
      -> Human Approval
    """

    def __init__(self, data_path="data/sample_data.json"):

        with open(data_path, "r") as file:
            self.data = json.load(file)

        self.sensing_agent = SensingAgent()
        self.impact_agent = ImpactAnalysisAgent()
        self.planning_agent = PlanningAgent()
        self.execution_agent = ExecutionSupportAgent()
        self.llm_service = get_llm_service()

    def analyze(self, event_index=0):

        # -----------------------------------------
        # 1. SENSING
        # -----------------------------------------

        event = self.data["events"][event_index]

        sensing_result = self.sensing_agent.analyze_event(
            event,
            self.data["tariffs"]
        )

        if not sensing_result["detected"]:
            return {
                "status": "NO_DISRUPTION",
                "sensing": sensing_result
            }

        # -----------------------------------------
        # 2. FIND PRODUCT
        # -----------------------------------------

        product = next(
            product
            for product in self.data["products"]
            if product["id"] == sensing_result["product_id"]
        )

        # -----------------------------------------
        # 3. FIND CURRENT SUPPLIER
        # -----------------------------------------

        supplier = next(
            supplier
            for supplier in self.data["suppliers"]
            if (
                supplier["product_id"]
                == sensing_result["product_id"]
                and supplier["country"]
                == sensing_result["origin"]
            )
        )

        # -----------------------------------------
        # 4. FIND INVENTORY
        # -----------------------------------------

        inventory = next(
            inventory
            for inventory in self.data["inventory"]
            if inventory["product_id"]
            == sensing_result["product_id"]
        )

        # -----------------------------------------
        # 5. IMPACT ANALYSIS
        # -----------------------------------------

        impact_result = self.impact_agent.analyze(
            sensing_result,
            product,
            supplier,
            inventory
        )

        # -----------------------------------------
        # 6. PLANNING
        # -----------------------------------------

        planning_result = self.planning_agent.generate_plan(
            impact_result,
            self.data["suppliers"],
            product
        )

        # -----------------------------------------
        # 7. EXECUTION SUPPORT
        # -----------------------------------------

        execution_result = self.execution_agent.prepare_action(
            planning_result,
            impact_result
        )

        # -----------------------------------------
        # 8. LLM ANALYSIS
        # -----------------------------------------

        llm_prompt = f"""
You are an AI supply chain resilience analyst.

Analyze the following structured supply-chain disruption.

SENSING RESULT:
{sensing_result}

IMPACT RESULT:
{impact_result}

PLANNING RESULT:
{planning_result}

EXECUTION PLAN:
{execution_result}

Provide a concise management analysis covering:

1. Why the disruption matters
2. The financial and inventory implications
3. Why the proposed supplier alternative is relevant
4. The key negotiation or deal opportunity
5. The main risk the manager should consider before approval

Use only the information provided above.
Do not invent tariffs, prices, suppliers, timelines, regulations,
or other facts.
"""

        llm_analysis = self.llm_service.generate(
            prompt=llm_prompt,
            system_prompt=(
                "You are a supply-chain resilience analyst. "
                "Base your response only on the supplied structured data. "
                "Do not invent facts."
            )
        )

        # -----------------------------------------
        # 9. FINAL RESPONSE
        # -----------------------------------------

        return {
            "status": "DISRUPTION_DETECTED",
            "sensing": sensing_result,
            "impact": impact_result,
            "planning": planning_result,
            "llm_analysis": llm_analysis,
            "execution": execution_result
        }
