#!/usr/bin/env python3
"""
clean data from maven
"""
import yaml
import numpy as np

from loguru import logger
from typing import List, Dict, Any, Tuple
from os.path import join
from tqdm import tqdm

from shared.utils import get_file_path_relative, list_files, clean_directory
from shared.type import NLPType, LanguageType
from shared.variables import (
    data_folder,
    clean_data_folder,
    main_data_file,
    type_path_dict,
    datasets_folder,
)


def process_raw_yaml_input(raw: List[Dict[str, Any]], pth: str) -> Tuple[List[str], int]:
    output: List[str] = []
    num_versions: int = 0
    for item in raw:
        try:
            output.append('.'.join(item['id']))
            num_versions += len(item['versions'])
        except Exception as err:
            logger.error(f"Error at path {pth}")
            logger.error(err)

    return output, num_versions

@logger.catch
def main(cleaning_type: NLPType, language: LanguageType) -> None:
    """
    load and clean the dataset from the package managers
    """
    folder_name: str = type_path_dict[cleaning_type]
    data_folder_path: str = get_file_path_relative(
        join(data_folder, datasets_folder, folder_name, language.name)
    )
    output_folder_path: str = get_file_path_relative(
        join(data_folder, clean_data_folder, folder_name, language.name)
    )

    logger.info(f"Retrieving data paths from: {data_folder_path}")
    filepaths: List[str] = [join(data_folder_path, filepath) for filepath in list_files(data_folder_path, "yml")]
    
    libraries: List[str] = []
    num_versions = 0
    for filepath in tqdm(filepaths):
        with open(filepath, 'r') as f:
            raw = yaml.safe_load(f)
            curr_libraries, curr_num_versions = process_raw_yaml_input(raw, filepath)
            libraries += curr_libraries
            num_versions += curr_num_versions
    
    clean_directory(join(output_folder_path), "csv")
    np.savetxt(join(output_folder_path, main_data_file),
                    libraries, delimiter=", ", fmt="% s")
    logger.info(f'num versions: {num_versions}')

    

if __name__ == "__main__":
    main(NLPType.base_library, LanguageType.java)
