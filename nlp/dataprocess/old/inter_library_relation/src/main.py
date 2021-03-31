#!/usr/bin/env python
"""
main file
entry point for running nlp dataload module
"""

from asyncio import get_event_loop
from clean.library_clean import main as dataclean_main
from shared.config import read_config
from load.library_load import main as dataload_main
from loguru import logger


@logger.catch
async def main() -> None:
    """
    main entry point
    """
    read_config()
    dataload_main()
    await dataclean_main()


if __name__ == '__main__':
    loop = get_event_loop()
    loop.run_until_complete(main())