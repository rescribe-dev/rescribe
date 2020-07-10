#!/usr/bin/env python3
"""
main file

entry point for running nlp deployment module
"""

from server import start_server
from initialize_model import main as initialize_model
from get_prediction import initialize_classification_labels
from config import read_config


def main() -> None:
    """
    main entry point
    """
    read_config()
    initialize_model()
    initialize_classification_labels()
    start_server()


if __name__ == '__main__':
    main()
