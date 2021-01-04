"""
ModelEvaluator
"""
import pandas as pd

from .BaseModel import BaseModel


class ModelEvaluator:
    """
    Model evaluator
    """

    def __init__(self, model: BaseModel):
        """
        init
        """
        self.model = model

    def get_roc_curve(self) -> pd.DataFrame:
        """
        get roc curve
        """

    def get_accuracy(self) -> float:
        """
        get accuracy of a model
        """

    def get_precision(self) -> float:
        """
        get precision
        """

    def get_recall(self) -> float:
        """
        get recall
        """
