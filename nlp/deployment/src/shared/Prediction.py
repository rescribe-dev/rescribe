"""
Class used to store all NLP predictions
"""


class Prediction:
    """
    prediction object, output
    """

    def __init__(self, name: str, score: float) -> None:
        """
        prediction initializer
        """
        self.name = name
        self.score = score

    def to_json(self) -> str:
        """
        Convert to JSON format string representation.
        """
        return self.__dict__

    def __str__(self) -> str:
        return str(self.__dict__)

    def __repr__(self):
        return self.__str__()
