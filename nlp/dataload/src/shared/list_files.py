#!/usr/bin/env python3
"""
list files
"""
from os import listdir
from typing import List


def list_files(directory, extension) -> List[str]:
    """
    list files
    """
    return [f for f in listdir(directory) if f.endswith('.' + extension)]
