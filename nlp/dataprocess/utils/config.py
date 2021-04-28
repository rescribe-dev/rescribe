#!/usr/bin/env python
"""
config file

reads configuration from environment
"""

from os import environ, getenv
from typing import Union

from dotenv import find_dotenv, load_dotenv

"""
Module that monkey-patches json module when it's imported so
JSONEncoder.default() automatically checks for a special "to_json()"
method and uses it to encode the object if found.

see https://stackoverflow.com/a/18561055/8623391
"""
from json import JSONEncoder


def _default(self, obj):  # pylint: disable=unused-argument
    """
    default json serialize
    """
    return getattr(obj.__class__, "to_json", _default.default)(obj)


_default.default = JSONEncoder.default  # Save unmodified default.
JSONEncoder.default = _default  # Replace it.


PRODUCTION: bool = False


def read_config() -> None:
    """
    main entry point
    """
    global PRODUCTION
    load_dotenv(find_dotenv())
    production_str: Union[str, None] = getenv("PRODUCTION")
    if production_str is not None:
        PRODUCTION = production_str == "true"
    environ["CUDA_VISIBLE_DEVICES"] = str(0)
