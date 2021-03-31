#!/usr/bin/env python
"""
config file

reads configuration from environment
"""

from os import getenv
from typing import Union
from utils.config import read_config

ELASTICSEARCH_HOST: str = ""


def read_config_language_prediction() -> None:
    """
    read config for language_prediction
    """
    read_config()
