#!/usr/bin/env python
"""
clean data
"""

import tarfile
from os import remove
from os.path import basename, dirname, join
from typing import Tuple

import boto3
import numpy as np
import pandas as pd
from loguru import logger
from sklearn.preprocessing import LabelEncoder

from utils.types import NLPType
from utils.utils import get_file_path_relative, list_files
from utils.variables import (
    clean_data_folder,
    data_folder,
    datasets_bucket_name,
    type_path_dict,
)


def save_to_s3(cleaning_type: NLPType):
    """
    save clean data to s3
    """
    folder_name: str = type_path_dict[cleaning_type]
    output_folder_path: str = get_file_path_relative(
        join(data_folder, clean_data_folder, folder_name)
    )

    output_file: str = join(output_folder_path, "data.tar.gz")

    try:
        remove(output_file)
        logger.warning(f"Output file found at {output_file} deleting...")
    except FileNotFoundError:
        logger.info("Did not find output file to remove, directory appears to be clean")
    except Exception as err:
        logger.error("Fatal error in save_to_s3 for bert")
        raise err

    # zip the whole folder
    with tarfile.open(output_file, "w:gz") as tar:
        for filepath in list_files(output_folder_path, "*"):
            tar.add(filepath, arcname=basename(filepath))

    from utils.config import PRODUCTION

    if PRODUCTION:
        s3_client = boto3.resource("s3")
        s3_filepath = join(basename(dirname(output_file)), basename(output_file))
        obj = s3_client.Object(datasets_bucket_name, s3_filepath)
        with open(output_file, "rb") as tar:
            obj.put(Body=tar)


def library_label_to_numeric(
    frame: pd.DataFrame,
    labelencoder: LabelEncoder,
    str_column: str = "tags",
    cat_column: str = "tags_cat",
) -> Tuple[pd.DataFrame, np.ndarray]:
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


def language_label_to_numeric(
    frame: pd.DataFrame,
    labelencoder: LabelEncoder,
    str_column: str = "tags",
    cat_column: str = "tags_cat",
) -> Tuple[pd.DataFrame]:
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
    return frame
