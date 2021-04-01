#!/usr/bin/env python
"""
This is deprecated, use the javascript code to handle this
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

from loguru import logger
from typing import List, Dict
from google.cloud import bigquery

from utils.types import NLPType
from utils.libraries import libraries
from utils.bigquery.big_query_helper import BigQueryHelper as bqh
from utils.bigquery.get_bigquery_client import get_bigquery_client
from utils.utils import get_file_path_relative, clean_folder, save_to_disk, get_values_concat, clean_regex_str
from utils.variables import bucket_name, data_folder, datasets_folder, base_library_prediction_data_folder, raw_data_file_name, credentials_file, compression_extension, dataset_length

s3_client = boto3.client('s3')

def load_data(dataset_length: int = dataset_length) -> pd.DataFrame:
    from utils.config import PRODUCTION
    
    # retrieve the Bigquery Helper
    client: bigquery.Client = get_bigquery_client(NLPType.base_library_prediction)
    
    database = bqh(active_project="bigquery-public-data",
           dataset_name="stackoverflow",
           client=client)
          
    # Build the SQL query
    tag_matching = get_values_concat(libraries)
    
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
    folder_name: str = base_library_prediction_data_folder
    output_folder = get_file_path_relative(
        os.path.join(data_folder, datasets_folder, folder_name)
    )
    clean_folder(output_folder, ['*.csv', '*.tgz', '*.gzip', '*.gz'])
    
    output_path = os.path.join(output_folder, f"{raw_data_file_name}.{compression_extension}")
    
    # Save new data to output folder
    logger.info(f"Writing to Local Disk - {output_path}")
    
    save_to_disk({raw_data_file_name: dataset}, output_path, compression_extension)
    print(os.path.basename(output_path))
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
    logger.info('\n' + str(dataset.sample(5, replace=True)) + '\n')
    logger.success("\n\nData Load Complete\n")
    
    
if __name__ == '__main__':
    main()