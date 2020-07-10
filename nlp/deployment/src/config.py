#!/usr/bin/env python3
"""
config file

reads configuration from environment
"""

from dotenv import load_dotenv
from os import getenv
from typing import Union

PORT: int = -1

DEFAULT_PORT = 8082

PRODUCTION: bool = False


def read_config() -> None:
    """
    main entry point
    """
    global PORT
    global PRODUCTION

    load_dotenv()
    env_port: Union[str, None] = getenv('PORT')
    PORT = DEFAULT_PORT if env_port is None else int(env_port)
    production_str: Union[str, None] = getenv('PRODUCTION')
    if PRODUCTION is not None:
        PRODUCTION = production_str == 'true'
