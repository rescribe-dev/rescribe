#!/usr/bin/env python3
"""
clean data from maven
"""
import yaml

from loguru import logger
from typing import List

from shared.utils import get_file_path_relative, list_files
from shared.type import NLPType, LanguageType
from shared.variables import (
  data_folder,
  type_path_dict,
  datasets_folder,
)

@logger.catch
def main(cleaning_type: NLPType, language: LanguageType) -> None:
  """
  load and clean the dataset from the package managers
  """
  folder_name: str = type_path_dict[cleaning_type]
  data_folder_path: str = get_file_path_relative(
    f'{data_folder}/{datasets_folder}/{folder_name}/{language.name}'
  )

  logger.info(f"Retrieving data paths from: {data_folder_path}")
  filepaths: List[str] = list_files(data_folder_path, "yml")
  for filepath in filepaths:
    logger.info(f"path: {filepath}")

if __name__ == "__main__":
  main(NLPType.base_library, LanguageType.java)