import os
from typing import Optional


class LLMService:
    """
    LLM abstraction for the HackFest AI Agents Engine.

    Modes:
    - sap: reserved for SAP Generative AI Hub / Claude
    - demo: local deterministic fallback for development
    """

    def __init__(self):
        self.mode = os.getenv("LLM_MODE", "demo").lower()

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 500,
        temperature: float = 0.2,
    ) -> str:

        if self.mode == "sap":
            return self._generate_sap(
                prompt,
                system_prompt,
                max_tokens,
                temperature,
            )

        return self._generate_demo(prompt)

    def _generate_sap(
        self,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float,
    ) -> str:

        from gen_ai_hub.proxy.native.amazon import Session

        model_name = os.getenv(
            "AICORE_MODEL_NAME",
            "anthropic--claude-4.5-haiku"
        )

        bedrock = Session().client(
            model_name=model_name
        )

        import json

        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]

        if system_prompt:
            messages.insert(
                0,
                {
                    "role": "system",
                    "content": system_prompt
                }
            )

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages,
        })

        response = bedrock.invoke_model(
            body=body
        )

        response_body = json.loads(
            response["body"].read()
        )

        return response_body["content"][0]["text"]

    def _generate_demo(self, prompt: str) -> str:

        return (
            "AI Analysis:\n\n"
            "The detected supply-chain disruption requires "
            "evaluation of cost, inventory exposure, supplier "
            "alternatives, logistics constraints, and negotiation "
            "opportunities.\n\n"
            "Recommended approach:\n"
            "1. Quantify the incremental landed cost.\n"
            "2. Evaluate alternative suppliers and lead times.\n"
            "3. Assess inventory coverage during supplier transition.\n"
            "4. Compare negotiation opportunities with sourcing alternatives.\n"
            "5. Route the recommendation to the manager for approval."
        )


def get_llm_service() -> LLMService:
    return LLMService()