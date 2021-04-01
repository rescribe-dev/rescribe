#!/usr/bin/env python
"""
config file

reads configuration from environment
"""

from os import getenv
from typing import Union
from utils.config import read_config

ELASTICSEARCH_HOST: str = ''


def read_config_base_library_prediction() -> None:
    """
    read config for base library predict
    """
    read_config()
    global ELASTICSEARCH_HOST
    elasticsearch_host: Union[str, None] = getenv('ELASTICSEARCH_HOST')
    if elasticsearch_host is None:
        raise ValueError('no elasticsearch host provided')
    ELASTICSEARCH_HOST = elasticsearch_host
