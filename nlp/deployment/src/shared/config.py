#!/usr/bin/env python
"""
config file

reads configuration from environment
"""

from dotenv import load_dotenv, find_dotenv
from os import getenv, environ
from typing import Union
import shared.json_fix  # pylint: disable=unused-import

PRODUCTION: bool = False


def read_config() -> None:
    """
    main entry point
    """
    global PRODUCTION
    load_dotenv(find_dotenv())
    production_str: Union[str, None] = getenv('PRODUCTION')
    if production_str is not None:
        PRODUCTION = production_str == 'true'
    environ['CUDA_VISIBLE_DEVICES'] = str(0)