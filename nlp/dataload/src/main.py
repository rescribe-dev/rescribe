#!/usr/bin/env python3
"""
main file

entry point for running nlp dataload module
"""

from config import read_config
from dataload import main as dataload_main
from dataclean import main as dataclean_main
from dataprocess import main as dataprocess_main


def main() -> None:
    """
    main entry point
    """
    read_config()
    dataload_main()
    dataclean_main()
    dataprocess_main()


if __name__ == '__main__':
    main()
