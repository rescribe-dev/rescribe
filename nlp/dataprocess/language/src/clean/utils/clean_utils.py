#!/usr/bin/env python3
"""
clean data
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from typing import Tuple


def library_label_to_numeric(frame: pd.DataFrame, labelencoder: LabelEncoder, str_column: str = "tags", cat_column: str = "tags_cat") -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Takes in a dataframe with string labels and converts them into numerical categories
    :param frame: original dataframe with categorical data
    :param str_column: the column containing string categories
    :param cat_column: name of the new numerically categorical column
    :returns: the original dataframe with the cat_column added to it
    """
    categories = labelencoder.transform(frame[str_column])
    output = []
    classes = labelencoder.classes_
    length = len(classes)
    for cat in categories:
        temp = [0] * length
        temp[cat] = 1
        output.append(temp)
    output = pd.Series(output)
    frame[cat_column] = output
    return frame, classes


def language_label_to_numeric(frame: pd.DataFrame, labelencoder: LabelEncoder, str_column: str = "tags", cat_column: str = "tags_cat") -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Takes in a dataframe with string labels and converts them into numerical categories
    :param frame: original dataframe with categorical data
    :param str_column: the column containing string categories
    :param cat_column: name of the new numerically categorical column
    :returns: the original dataframe with the cat_column added to it
    """
    categories = labelencoder.transform(frame[str_column])
    output = []
    classes = labelencoder.classes_
    length = len(classes)
    for cat in categories:
        temp = [0] * length
        temp[cat] = 1
        output.append(temp)
    output = pd.Series(output)
    frame[cat_column] = output
    return frame, classes
