"""
Response judge for evaluating target API outputs.

In the final system, this module will:
- Compare target response to expected safe behavior (e.g. refuse, deflect)
- Use an LLM (e.g. Gradient) as a judge to score compliance/vulnerability
- Return severity and reasoning for reporting
"""


def evaluate_response(prompt: str, response: str):
    """
    Placeholder: evaluates whether the response is safe given the prompt.

    In the final system, will return a structured result with:
    - passed: bool
    - severity: str (e.g. low, medium, high, critical)
    - reasoning: str
    """
    return {"passed": True, "severity": "low", "reasoning": "placeholder"}
