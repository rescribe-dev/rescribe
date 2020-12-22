#!/usr/bin/env python3
"""
Utility functions for NLP
"""
import pandas as pd

from os import listdir, remove, makedirs
from os.path import abspath, join, exists
from enum import Enum
from pathlib import Path
from loguru import logger
from typing import List, Dict, Optional, Any, Iterable


def enum_to_dict(enum: Enum) -> Dict[str, Any]:
    """
    Return the dictionary incarnation of an input enum
    """
    output: Dict[str, Any] = {}
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
    list files
    """
    return [f for f in listdir(directory) if f.endswith('.' + extension)]


def clean_directory(directory: str, extensions: Iterable) -> None:
    """
    Remove all files within a directory with the specified extensions
    If the directory does not exist create the empty directory
    """
    if isinstance(extensions, str):
        extensions = [extensions]
        
    if not exists(directory):
        logger.critical(
            f"Attempting to clean a nonexistent directory: {directory}\nCreating empty folder")
        makedirs(directory)
        return

    filepaths: List[str] = []
    for extension in extensions:
        filepaths += list_files(directory, extension)

    for filepath in filepaths:
        remove(join(directory, filepath))


def normalize_filename(filename: str, file_id: str) -> str:
    """
    Given a filename and fileID, return the save path
    input: filename.extension, id
    returns: filename.id.extension.dat
    """
    filename_list: List[str] = filename.split('.')
    filename_list.append('dat')
    filename_list.insert(-2, file_id)

    return '.'.join(filename_list)


def original_filename(normalized_filename: str) -> str:
    """
    Given a normalized filename, return the original filename
    input: filename.id.extension.dat
    returns: filename.extension, id
    """
    filename_list: List[str] = normalized_filename.split('.')
    file_id: str = filename_list.pop(-3)

    return '.'.join(filename_list[:-1]), file_id
