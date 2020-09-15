#!/usr/bin/env python3
"""
main file

entry point for running nlp deployment module
"""

from server import start_server
from initialize_models import main as initialize_models
from config import read_config
from shared.type import NLPType
from typing import Optional
from sys import argv

# TODO - finalize environment file


def main(model_type: Optional[NLPType] = None) -> None:
    """
    main entry point
    """
    read_config()
    initialize_models(model_type)
    start_server()


if __name__ == '__main__':
    if len(argv) < 2:
        raise ValueError('no nlp type provided')
    main(NLPType(argv[1]))
