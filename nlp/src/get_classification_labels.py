#!/usr/bin/env python3
"""
get classification labels
"""
from typing import List, Set
from pandas import DataFrame, Series


def get_classification_labels(dataframe: DataFrame,
                              delim: str = '|', column: str = "__tags__") -> Set[str]:
    """
    get classification labels
    """
    classification_list: List[str] = []
    classifications: Series = dataframe[column]
    for cls in classifications:
        for tag in cls.split(delim):
            classification_list.append(tag)

    return set(classification_list)
