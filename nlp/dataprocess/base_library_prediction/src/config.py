#!/usr/bin/env python3
"""
config file

reads configuration from environment
"""

from os import getenv
from typing import Union

ELASTICSEARCH_HOST: str = ''


def read_config_base_library_predict() -> None:
    """
    read config for base library predict
    """
    global ELASTICSEARCH_HOST
    elasticsearch_host: Union[str, None] = getenv('ELASTICSEARCH_HOST')
    if elasticsearch_host is None:
        raise ValueError('no elasticsearch host provided')
    ELASTICSEARCH_HOST = elasticsearch_host
