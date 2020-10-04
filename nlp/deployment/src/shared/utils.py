#!/usr/bin/env python3
"""
list files
"""
import pandas as pd
from os import listdir
from os.path import abspath, join
from enum import Enum
from typing import List, Dict, Optional, Any
from pathlib import Path


def enum_to_dict(enum: Enum) -> Dict[Any, Any]:
    """
    Return the dictionary incarnation of an input enum
    """
    output: Dict = dict()
    for item in enum:
        output[item.name] = item.value

    return output


def _compress_labels_helper(tags, langs: Dict) -> Optional[Any]:
    """
    Helper to encapsulate the inner loops of the process running in key label. This enables the use of a
    'continue' statement to complete row processing
    """
    for (key, labels) in langs.items():
        for tag in tags.split("|"):
            if tag in labels:
                return key

    return None


def compress_labels(frame: pd.DataFrame, keys: Dict) -> pd.DataFrame:
    """
    This takes in a dataframe and then a dict of {"key": ["associated labels"]} and transforms our dataset into
    id  |   title    |   tags
    num | "whatever" | "language"
    :param frame: Data frame of stackoverflow-like data
    :param keys: dict of {"eky": ["associated labels"]}
    :returns: Labeled data without the initial tag information
    """
    output = pd.DataFrame()

    for _index, row in frame.iterrows():
        tags = row["tags"]
        new_label = _compress_labels_helper(tags, keys)
        if new_label is not None:
            new_row = {"id": row["id"],
                       "title": row["title"], "tags": new_label}
            output = output.append(new_row, ignore_index=True)
            continue

    return output


def get_file_path_relative(path):
    """
    returns path relative to the home folder (nlp)
    """
    current_path = abspath(Path(__file__).absolute())
    separator = '/nlp/'
    split_path = current_path.split(separator)
    if len(split_path) < 2:
        raise RuntimeError('nlp path not found')
    nlp_path = abspath(join(split_path[0], separator.replace('/', '')))
    return abspath(join(nlp_path, path))


def list_files(directory, extension) -> List[str]:
    """
    Returns files that end with the given extension (NO DOT) (NOT REGEX COMPATIBLE)
    """
    return [f for f in listdir(directory) if f.endswith('.' + extension)]
