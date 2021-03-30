#!/usr/bin/env python
"""
load data into post questions
"""

#################################
# for handling relative imports #
#################################
if __name__ == '__main__':
    import sys
    from pathlib import Path
    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents
                if str(elem).endswith('dataprocess'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

import os
import boto3
import pandas as pd

from glob import glob
from loguru import logger
from typing import List, Dict
from google.cloud import bigquery

from utils.types import NLPType
from utils.languages import languages
from utils.bigquery.big_query_helper import BigQueryHelper as bqh
from utils.bigquery.get_bigquery_client import get_bigquery_client
from utils.utils import get_file_path_relative, clean_folder, save_to_disk
from utils.variables import bucket_name, data_folder, language_predict_raw_data_folder, raw_data_file_name

DEFAULT_DATASET_LENGTH: int = 100

s3_client = boto3.client('s3')
credentials_file: str = 'utils/bigquery/bigquery_credentials.json'


def get_values_concat(input_dictionary: Dict[str, List[str]]) -> List[str]:
    """
    flatten dictionary to list of strings
    """
    return_list: List[str] = []
    for value in input_dictionary.values():
        return_list.extend(value)
    return return_list
 
def clean_regex_str(input_str: str) -> str:
    """
    sanitize regex bigquery string
    """
    return input_str.replace('+', '\\+')
    
def load_data(dataset_length: int = DEFAULT_DATASET_LENGTH) -> pd.DataFrame:
    from utils.config import PRODUCTION
    
    # retrieve the Bigquery Helper
    client: bigquery.Client = get_bigquery_client(NLPType.language_prediction)
    
    database = bqh(active_project="bigquery-public-data",
           dataset_name="stackoverflow",
           client=client)
          
    # Build the SQL query
    tag_matching = get_values_concat(languages)
    
    tags_regex = clean_regex_str(
        '|'.join(map(lambda tag: tag + '[\\||$]', tag_matching))
    )
    
    conditional: str = f'accepted_answer_id IS NOT NULL AND tags IS NOT NULL AND REGEXP_CONTAINS(tags, r"({tags_regex})")'
    
    query: str = f"""
    SELECT 
        id, title, tags
    FROM 
        bigquery-public-data.stackoverflow.posts_questions
    WHERE {conditional}
    LIMIT {dataset_length}
    """
    
    dataset: pd.DataFrame = database.query_to_pandas(query)
    
    
    # Determine output path and clean any existing data held within
    folder_name: str = language_predict_raw_data_folder
    output_folder = get_file_path_relative(
        f'{data_folder}/{folder_name}'
    )
    clean_folder(output_folder, ['*.tar'])
    
    output_path = os.path.join(output_folder, raw_data_file_name)
    
    # Save new data to output folder
    logger.info(f"Writing to Local Disk - {output_path}")
    
    save_to_disk(dataset, output_path, 'tar')
    
    if PRODUCTION:
        s3_client.upload_file(
            dataset, bucket_name, os.path.basename(output_path)    
        )
    
    return dataset
    
@logger.catch
def main() -> pd.DataFrame:
    dataset: pd.DataFrame = load_data()

    logger.info("\nMETADATA:\n" + str(dataset.dtypes))
    logger.info(f"Number of rows: {len(dataset)}")
    logger.info('\n' + str(dataset.sample(5)) + '\n')
    logger.success("\n\nData Load Complete\n")
    
    
if __name__ == '__main__':
    main()