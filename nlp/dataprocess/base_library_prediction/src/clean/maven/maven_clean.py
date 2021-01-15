#!/usr/bin/env python3
"""
clean data from maven
"""
import yaml

from loguru import logger
from typing import List, Dict, Any
from os.path import join
from tqdm import tqdm

from shared.utils import get_file_path_relative, list_files
from shared.type import NLPType, LanguageType
from shared.variables import (
  data_folder,
  type_path_dict,
  datasets_folder,
)


def process_raw_yaml_input(raw: List[Dict[str, Any]]) -> List[str]:
    output: List[str] = []
    for item in raw:
      output.append('.'.join(item['id']))

    return output

@logger.catch
def main(cleaning_type: NLPType, language: LanguageType) -> None:
    """
    load and clean the dataset from the package managers
    """
    folder_name: str = type_path_dict[cleaning_type]
    data_folder_path: str = get_file_path_relative(
      join(data_folder, datasets_folder, folder_name, language.name)
    )

    logger.info(f"Retrieving data paths from: {data_folder_path}")
    filepaths: List[str] = [join(data_folder_path, filepath) for filepath in list_files(data_folder_path, "yml")]
    
    libraries: List[str] = []
    for filepath in tqdm(filepaths):
      with open(filepath, 'r') as f:
        raw = yaml.safe_load(f)
        libraries += process_raw_yaml_input(raw)
    
    print(libraries[:10])

if __name__ == "__main__":
    main(NLPType.base_library, LanguageType.java)