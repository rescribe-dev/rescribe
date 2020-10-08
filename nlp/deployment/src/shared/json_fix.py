#!/usr/bin/env python3
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
