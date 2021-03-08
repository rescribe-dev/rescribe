#!/usr/bin/env python
"""
config file

reads configuration from environment
"""

#################################
# for handling relative imports #
#################################
if __name__ == '__main__':
    import sys
    from pathlib import Path
    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents
                if str(elem).endswith('src'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

from os import getenv
from typing import Union
from shared.config import read_config as read_shared_config

PORT: int = -1
DEFAULT_PORT: int = 8082

VERSION: str = ''
DEFAULT_VERSION: str = '0.0.1'


def read_config() -> None:
    """
    read the config for deployment
    """
    global PORT
    global VERSION

    read_shared_config()
    env_port: Union[str, None] = getenv('NLP_PORT')
    PORT = DEFAULT_PORT if env_port is None else int(env_port)
    env_version: Union[str, None] = getenv('VERSION')
    VERSION = DEFAULT_VERSION if env_version is None else env_version
