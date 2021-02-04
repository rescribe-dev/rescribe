"""
Base model that all of our nlp models should inherit from
"""
from abc import ABCMeta, abstractmethod
from typing import List

from shared.Prediction import Prediction


class BaseModel(metaclass=ABCMeta):
    """
    Base Model class
    """

    def __init__(self):
        """
        init
        """

    @property
    @abstractmethod
    def mode(self):
        """
        Mode of the model object
        initial training, load from disk, etc...
        """

    @abstractmethod
    def predict(self, query: str, **kwargs) -> List[Prediction]:
        """
        predict
        """
