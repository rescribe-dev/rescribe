#!/usr/bin/env python
"""
nlp type
"""

from enum import Enum
from typing import Dict
from utils.utils import enum_to_dict


class Languages(Enum):
    """
    Enum to contain all of the languages we support
    """
    python = ["python", "python-2.7", "python-3.x", "python-3.6", "python-3.7",
              "python-3.5", "python-3.4", "python-2.x", "python-notebook"]
    java = ["java", "java-8", "java-7", "java-11",
            "java-9", "java-native-interface", "javabeans"]
    cpp = ["c++", "cppunit", "c++98", "libstdc++", "c++03",
           "c++-standard-library", "dev-c++", "c++20", "c++17", "c++14", "c++11"]


languages: Dict = enum_to_dict(Languages)
