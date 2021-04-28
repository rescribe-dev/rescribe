#!/usr/bin/env python
"""
nlp type
"""

from enum import Enum
from typing import Any, Set


class BaseEnum(Enum):
    """
    Base Enum with methods that all of our enums should implement
    """

    @classmethod
    def has_value(cls, value: Any) -> bool:
        """
        Return true / false for whether the input is stored as a value in the enum
        """
        values = cls.get_values()
        return value in values

    @classmethod
    def get_values(cls) -> Set[Any]:
        """
        Return a list of the values stored within the enum
        """
        return set(item.value for item in cls)


class LanguageType(BaseEnum):
    java = "java"
    python = "python"
    cpp = "cpp"


class PackageManager(BaseEnum):
    maven = "maven"
    pip = "pip"
    conda = "conda"
    gradle = "gradle"


class ModelMode(BaseEnum):
    """
    Mode of model initialization
    """

    initial_training = "initial_training"
    load_pretrained = "load_pretrained"


class NLPType(BaseEnum):
    """
    Enum to store nlp types
    """

    language_prediction = "language_prediction"
    base_library_prediction = "base_library_prediction"
    related_library_prediction = "related_library_prediction"
