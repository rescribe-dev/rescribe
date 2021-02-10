#!/usr/bin/env python
"""
main file

entry point for running nlp deployment module
"""

from server import start_server
from initialize_models import main as initialize_models
from config import read_config
from shared.type import NLPType
from typing import Optional

# TODO - finalize environment file


def main() -> None:
    """
    main entry point
    """
    read_config()
    for model_type in NLPType:
        if model_type is not NLPType.base_library:
            initialize_models(model_type)
    start_server()


if __name__ == '__main__':
    main()
