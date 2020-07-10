#!/usr/bin/env python3
"""
main file

entry point for running nlp training module
"""

from dotenv import load_dotenv
from train import main as training_main


def main() -> None:
    """
    main entry point
    """
    load_dotenv()
    training_main()


if __name__ == '__main__':
    main()
