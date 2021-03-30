#!/usr/bin/env python
"""
config file

reads configuration from environment
"""
#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file: Path = Path(__file__).resolve()
    root = next(
        elem for elem in current_file.parents if str(elem).endswith("dataprocess")
    )
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################


from os import getenv
from typing import Union
from utils.config import read_config

ELASTICSEARCH_HOST: str = ""


def read_config_language_prediction() -> None:
    """
    read config for language_prediction
    """
    read_config()
