#!/usr/bin/env python3
"""
nlp type
"""

from enum import Enum
from typing import Dict, List
from shared.utils import enum_to_dict

class FileExtensions(Enum):
    """
    Enum to contain all of the file extensions we support
    """

    java = ["java"]
    cpp = ["cpp", "cc"]
    python = ["py"]

file_extensions: Dict[str, List[str]] = enum_to_dict(FileExtensions)