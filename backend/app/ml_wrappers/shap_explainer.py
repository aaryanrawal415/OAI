import shap
import numpy as np
from typing import Any, Dict

class ShapExplainer:
    """Wrap SHAP explanations for a given model."""
    def __init__(self, model):
        self.model = model
        self.explainer = shap.Explainer(model.predict, feature_names=None)

    def explain(self, X: Any) -> Dict:
        # X should be a 2D array-like
        shap_values = self.explainer(X)
        # Return mean absolute SHAP values per feature as a dict
        mean_abs = np.abs(shap_values.values).mean(axis=0)
        return {f"feature_{i}": float(v) for i, v in enumerate(mean_abs)}
