#!/usr/bin/env python
"""
main file

entry point for running nlp dataload module
"""

from clean.library_clean import main as dataclean_main
from loguru import logger
from config import read_config_base_library_predict


@logger.catch
def main() -> None:
    """
    main entry point
    """
    read_config_base_library_predict()
    dataclean_main()


if __name__ == '__main__':
    main()
