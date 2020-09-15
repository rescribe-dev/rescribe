#!/usr/bin/env python3
"""
nlp type
"""

from enum import Enum
from typing import Any, Set


class NLPType(Enum):
    """
    Enum to store nlp types
    """
    language = "language"
    library = "library"

    @classmethod
    def has_value(cls, value: Any) -> bool:
        """
        Return true / false for whether the input is stored as a value in the enum
        """
        values = NLPType.get_values()
        return value in values

    @classmethod
    def get_values(cls) -> Set[Any]:
        """
        Return a list of the values stored within the enum
        """
        return set(item.value for item in cls)
