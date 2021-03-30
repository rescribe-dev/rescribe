#!/usr/bin/env python
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
from shared.utils import get_file_path_relative, compress_labels, clean_directory
from shared.type import NLPType
from shared.languages import languages
from shared.libraries import libraries
from shared.variables import data_folder, clean_data_folder, main_data_file, \
    datasets_folder, classes_file, models_folder, type_path_dict
from clean.utils.clean_utils import library_label_to_numeric, language_label_to_numeric


def dataclean(cleaning_type: NLPType, label_compression_dict: Dict, chunksize: int = 1000) -> pd.DataFrame:
    """
    main datacleaning function
    """

    logger.info("Loading Data From Disk")

    folder_name: str = type_path_dict[cleaning_type]

    df_chunk: Union[pd.DataFrame] = pd.read_csv(
        get_file_path_relative(f'{data_folder}/{datasets_folder}/{folder_name}/{main_data_file}'), chunksize=chunksize)

    logger.success("Done")
    logger.info("Performing Batched Data Processing")
    output_preview = pd.DataFrame()
    classes: np.ndarray = []

    labelencoder = LabelEncoder()
    if cleaning_type == NLPType.language:
        labelencoder.fit(list(languages.keys()))
    elif cleaning_type == NLPType.base_library:
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
            elif cleaning_type == NLPType.base_library:
                frame, classes = library_label_to_numeric(
                    frame, labelencoder, str_column="tags", cat_column="tags_cat")

            write_path: str = join(output_folder_path, f'{i}.csv')
            logger.info(f"Writing To Disk - {write_path}")
            frame.to_csv(write_path, index=False)
            logger.success("Done\n")
        except Exception as err:
            logger.error(err)
            logger.error(f"failed to read chunk {i}")
            continue

        # only save first n
        if i < 100:
            output_preview = output_preview.append(
                frame.head(1), ignore_index=True)
    yaml_path = get_file_path_relative(
        f"{data_folder}/{models_folder}/{folder_name}/{classes_file}")
    with open(yaml_path, 'w') as yaml_file:
        yaml.dump(classes.tolist(), yaml_file)

    logger.success("Batched Data Processing Complete\n")
    return output_preview


def main(cleaning_type: NLPType, clean_dir: bool = True):
    """
    main clean data script
    """
    logger.info("\n\nInitiating Data Cleaning\n")
    if clean_dir:
        logger.info("Initiating Directory Cleaning")
        folder_name = type_path_dict[cleaning_type]
        clean_directory(
            get_file_path_relative(
                f'{data_folder}/{clean_data_folder}/{folder_name}'),
            ["dat", "csv"]
        )
        logger.success("Directory Cleaning Complete")

    if cleaning_type == NLPType.language:
        output_preview = dataclean(
            cleaning_type=cleaning_type, label_compression_dict=languages)
    elif cleaning_type == NLPType.base_library:
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
