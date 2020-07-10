#!/usr/bin/env python3
"""
main file

entry point for running nlp module
"""

from dotenv import load_dotenv
from dataload import main as dataload_main


def main() -> None:
    """
    main entry point
    """
    load_dotenv()
    dataload_main()


if __name__ == '__main__':
    main()
