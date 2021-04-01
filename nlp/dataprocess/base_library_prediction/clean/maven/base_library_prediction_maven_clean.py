#!/usr/bin/env python
"""
clean data from maven
"""
import os
import yaml
import boto3

import numpy as np

from tqdm import tqdm
from loguru import logger
from typing import List, Dict, Any, Tuple\

from utils.types import NLPType, LanguageType
from utils.utils import get_file_path_relative, list_files, clean_folder
from utils.variables import data_folder, clean_data_folder, clean_data_file_name, base_library_prediction_data_folder, datasets_folder, datasets_bucket_name

def process_raw_yaml_input(raw: List[Dict[str, Any]], pth: str) -> Tuple[List[str], int]:
    output: List[str] = []
    num_versions: int = 0
    for item in raw:
        try:
            output.append('.'.join(item['id']))
            num_versions += len(item['versions'])
        except Exception as err:
            logger.warning(f"Error at path {pth}")
            logger.warning(err)

    return output, num_versions
    
@logger.catch
def main(language: LanguageType) -> None:
    folder_name: str = base_library_prediction_data_folder
    raw_data_folder: str = get_file_path_relative(
        os.path.join(data_folder, datasets_folder, folder_name, language.name)    
    )
    output_folder: str = get_file_path_relative(
        os.path.join(data_folder, clean_data_folder, folder_name, language.name)    
    )
    
    logger.info(f"Retrieving data paths from: {raw_data_folder}")
    filepaths: List[str] = [os.path.join(raw_data_folder, filepath) for filepath in list_files(raw_data_folder, '*.yml')]
    
    if len(filepaths) == 0:
        # download from s3
        logger.fino('downloading files from s3')
        s3_client = boto3.resource('s3')
        bucket = s3_client.Bucket(datasets_bucket_name)
        
        for obj in tqdm(bucket.objects.filter(Prefix='/'.join(['libraries', language.name]))):
            if obj.key[-1] == '/':
                continue
            file_path_abs = get_file_path_relative(
                os.path.join(raw_data_folder, os.path.basename(obj.key))    
            )
            bucket.download_file(obj.key, file_path_abs)
            filepaths.append(file_path_abs)
    else:
        logger.info('files found')
    
    libraries: List[str] = []
    num_versions: int = 0
    for filepath in tqdm(filepaths):
        with open(filepath, 'r') as f:
            raw = yaml.safe_load(f)
            curr_libraries, curr_num_verisons = process_raw_yaml_input(raw, filepath)
            libraries += curr_libraries
            num_versions += curr_num_verisons
            
    clean_folder(os.path.join(output_folder), "*")
    np.savetxt(
        os.path.join(output_folder, clean_data_file_name, libraries, delimiter=', ', fmt='% s')
    )
    logger.info(f'num_versions: {num_versions}')
    
if __name__ == "__main__":
    main(LanguageType.java)