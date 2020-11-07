#!/usr/bin/env python3
"""
utils functions (utils.py)
"""

from glob import glob
from os.path import abspath, join
from loguru import logger
from typing import List
from pathlib import Path


def file_path_relative(rel_path: str) -> str:
    """
    get file path relative to base folder
    """
    return join(
        abspath(join(Path(__file__).absolute(), "../..")), rel_path
    )


def get_glob(glob_rel_path: str) -> List[str]:
    """
    get glob file list for given path
    """
    logger.info("getting files using glob")
    complete_path: str = file_path_relative(glob_rel_path)
    files = glob(complete_path)
    return files
