#!/usr/bin/env python3
"""
main file

entry point for running nlp dataload module
"""

from clean.language_clean import main as dataclean_main
from shared.config import read_config
from load.language_load import main as dataload_main
from loguru import logger


@logger.catch
def main() -> None:
    """
    main entry point
    """
    read_config()
    dataload_main()
    dataclean_main()


if __name__ == '__main__':
    main()
