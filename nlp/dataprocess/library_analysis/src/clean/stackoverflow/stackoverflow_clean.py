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


def dataclean(chunksize: int = 1000) -> pd.DataFrame:
    DISALLOW_SINGLE_IMPORT_FILES = True
    """
    main datacleaning function
    """

    logger.info("Loading Data From Disk")

    folder_name: str = "library_analysis" #TODO: Hardcoding = bad (grep for other)

    df_chunk: Union[pd.DataFrame] = pd.read_csv(
        get_file_path_relative(f'{data_folder}/{datasets_folder}/{folder_name}/{main_data_file}'), chunksize=chunksize)

    logger.success("Done")
    logger.info("Performing Batched Data Processing")
    output_preview = pd.DataFrame()
    classes: np.ndarray = []

    output_folder_path: str = get_file_path_relative(
        f'{data_folder}/{clean_data_folder}/{folder_name}')
    # delete all clean data
    for file_path in glob(join(output_folder_path, '*')):
        remove(file_path)

    id_col= 2
    lib_name_col = 1
    for i, chunk in enumerate(df_chunk):
        logger.info(f"Starting Batch {i}...")
        current_file = None
        list_item = chunk.values
        output_list = []
        file_imports = []
        for row in list_item:
            if(current_file != row[id_col]):
                if current_file is None:
                    current_file = row[id_col]
                else:
                    if not (DISALLOW_SINGLE_IMPORT_FILES and len(file_imports) == 1):
                        output_list.append(' '.join(file_imports))
                    file_imports.clear()
                    current_file = row[id_col]
            file_imports.append((str(row[lib_name_col])[:-1]).strip()) # -1 to get rid of the ; at the end of the line
        if not (DISALLOW_SINGLE_IMPORT_FILES and len(file_imports) == 1):
            output_list.append(' '.join(file_imports))
        arr_out = np.array(output_list)
        frame = pd.DataFrame(arr_out)
        try:
            write_path: str = join(output_folder_path, f'{i}.csv')
            logger.info(f"Writing To Disk - {write_path}")
            frame.to_csv(write_path, index=False, header=False)
            logger.success("Done\n")
        except Exception as err:
            logger.error(f"failed to write chunk {i}")
            logger.error(err)
            continue

        # only save first n
        if i < 100:
            output_preview = output_preview.append(
                frame.head(1), ignore_index=True)
    # yaml_path = get_file_path_relative(
    #     f"{data_folder}/{clean_data_folder}/{folder_name}/{classes_file}")
    # with open(yaml_path, 'w') as yaml_file:
    #     yaml.dump(classes.tolist(), yaml_file)

    logger.success("Batched Data Processing Complete\n")
    return output_preview


def main():
    """
    main clean data script
    """
    logger.info("\n\nInitiating Data Cleaning\n")

    
    output_preview = dataclean()
    logger.info("\n\nSample Constructed From Processed Batches\n")
    logger.info("\nMETADATA:\n" + str(output_preview.dtypes))
    logger.info(f"\n {str(output_preview.sample(5))}\n")
    logger.success("\n\nData Cleaning Complete\n")


if __name__ == '__main__':
    main()
