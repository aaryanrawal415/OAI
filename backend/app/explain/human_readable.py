def human_readable_decision(decision_id: str) -> str:
    """Return a human‑readable description for a given decision ID.
    In a real implementation this would look up the description from docs/DECISIONS.md.
    """
    mapping = {
        "D-010": "40 km excursion cap per off‑route stop",
        "D-011": "Job cap for routes ≤ 500 km",
        # Add more mappings as needed
    }
    return mapping.get(decision_id, f"{decision_id}: description not found")
