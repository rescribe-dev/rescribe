"""
Base model that all of our nlp models should inherit from
"""
from abc import ABCMeta, abstractmethod


class BaseModel(metaclass=ABCMeta):
    """
    Base Model class
    """

    def __init__(self):
        """
        init
        """

    @abstractmethod
    def fit(self):
        """
        train the model
        """

    @abstractmethod
    def predict(self):
        """
        predict
        """
