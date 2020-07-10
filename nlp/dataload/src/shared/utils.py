#!/usr/bin/env python3
"""
list files
"""
from os import listdir
from os.path import abspath, join, dirname
from typing import List


def get_file_path_relative(path):
    """
    returns path relative to this file up one
    """
    return abspath(join(dirname(__file__), '../', path))


def list_files(directory, extension) -> List[str]:
    """
    list files
    """
    return [f for f in listdir(directory) if f.endswith('.' + extension)]
