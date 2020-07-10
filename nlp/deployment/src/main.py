#!/usr/bin/env python3
"""
main file

entry point for running nlp module
"""

from os import getenv
from typing import Union
from dotenv import load_dotenv
from server import start_server
from initialize_model import main as initialize_model
from get_prediction import initialize_classification_labels

DEFAULT_PORT = 8082


def main() -> None:
    """
    main entry point
    """
    load_dotenv()
    env_port: Union[str, None] = getenv('PORT')
    port: int = DEFAULT_PORT if env_port is None else int(env_port)
    initialize_model()
    initialize_classification_labels()
    start_server(port)


if __name__ == '__main__':
    main()
