#!/usr/bin/env python3
"""
get classifications
"""
from typing import List
from pandas import DataFrame


def get_classifications(dataframe: DataFrame, classifications: List[str],
                        output_init: List[List[object]] = None,
                        delim: str = '|', column: str = "__tags__") -> List[List[object]]:
    """
    get classifications
    """
    if output_init:
        output: List[List[object]] = output_init
    for index, tags in enumerate(dataframe[column]):
        tag_list: List[str] = tags.split(delim)
        for tag in tag_list:
            output[index][classifications.index(tag)] = 1

    return output
