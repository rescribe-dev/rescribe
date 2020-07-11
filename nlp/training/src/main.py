#!/usr/bin/env python3
"""
main file

entry point for running nlp training module
"""

import argparse
from dotenv import load_dotenv
from train import main as training_main


def main() -> None:
    """
    main entry point
    """
    load_dotenv()

    parser = argparse.ArgumentParser()

    parser.add_argument("--learning-rate", type=int, default=1)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--communicator", type=str)
    parser.add_argument("--frequency", type=int, default=20)

    # optional arguments
    _args = parser.parse_args()

    training_main()


if __name__ == '__main__':
    main()
