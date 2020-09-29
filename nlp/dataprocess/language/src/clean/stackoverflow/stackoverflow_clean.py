#!/usr/bin/env python3
"""
clean data
"""

from typing import Dict, Union
import pandas as pd
import numpy as np
from sys import argv
from glob import glob
from os import remove
from os.path import join
from loguru import logger
import yaml
from sklearn.preprocessing import LabelEncoder
from shared.utils import get_file_path_relative, compress_labels
from shared.type import NLPType
from shared.languages import languages
from shared.libraries import libraries
from shared.variables import data_folder, clean_data_folder, main_data_file, language_data_folder, \
    datasets_folder, library_data_folder, classes_file
from clean.utils.clean_utils import library_label_to_numeric, language_label_to_numeric


def dataclean(cleaning_type: NLPType, label_compression_dict: Dict, chunksize: int = 1000) -> pd.DataFrame:
    """
    main datacleaning function
    """

    logger.info("Loading Data From Disk")

    folder_name: str = cleaning_type.name

    df_chunk: Union[pd.DataFrame] = pd.read_csv(
        get_file_path_relative(f'{data_folder}/{datasets_folder}/{folder_name}/{main_data_file}'), chunksize=chunksize)

    logger.success("Done")
    logger.info("Performing Batched Data Processing")
    output_preview = pd.DataFrame()
    classes: np.ndarray = []

    labelencoder = LabelEncoder()
    if cleaning_type == NLPType.language:
        labelencoder.fit(list(languages.keys()))
    elif cleaning_type == NLPType.library:
        labelencoder.fit(list(libraries.keys()))

    output_folder_path: str = get_file_path_relative(
        f'{data_folder}/{clean_data_folder}/{folder_name}')
    # delete all clean data
    for file_path in glob(join(output_folder_path, '*')):
        remove(file_path)

    for i, chunk in enumerate(df_chunk):
        logger.info(f"Starting Batch {i}...")
        frame = compress_labels(chunk, label_compression_dict)
        try:
            if cleaning_type == NLPType.language:
                frame, classes = language_label_to_numeric(
                    frame, labelencoder, str_column="tags", cat_column="tags_cat")
            elif cleaning_type == NLPType.library:
                frame, classes = library_label_to_numeric(
                    frame, labelencoder, str_column="tags", cat_column="tags_cat")

            write_path: str = join(output_folder_path, f'{i}.csv')
            logger.info(f"Writing To Disk - {write_path}")
            frame.to_csv(write_path, index=False)
            logger.success("Done\n")
        except Exception as err:
            logger.error(f"failed to read chunk {i}")
            continue

        # only save first n
        if i < 100:
            output_preview = output_preview.append(
                frame.head(1), ignore_index=True)
    yaml_path = get_file_path_relative(
        f"{data_folder}/{clean_data_folder}/{folder_name}/{classes_file}")
    with open(yaml_path, 'w') as yaml_file:
        yaml.dump(classes.tolist(), yaml_file)

    logger.success("Batched Data Processing Complete\n")
    return output_preview


def main(cleaning_type: NLPType):
    """
    main clean data script
    """
    logger.info("\n\nInitiating Data Cleaning\n")

    if cleaning_type == NLPType.language:
        output_preview = dataclean(
            cleaning_type=cleaning_type, label_compression_dict=languages)
    elif cleaning_type == NLPType.library:
        output_preview = dataclean(
            cleaning_type=cleaning_type, label_compression_dict=libraries)
    logger.info("\n\nSample Constructed From Processed Batches\n")
    logger.info("\nMETADATA:\n" + str(output_preview.dtypes))
    logger.info(f"\n {str(output_preview.sample(5))}\n")
    logger.success("\n\nData Cleaning Complete\n")


if __name__ == '__main__':
    if len(argv) < 2:
        raise ValueError('no nlp type provided')
    main(NLPType(argv[1]))
