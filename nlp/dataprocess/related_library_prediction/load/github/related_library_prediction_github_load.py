#!/usr/bin/env python
"""
load data from github 
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
import tarfile 
import pandas as pd

from tqdm import tqdm
from loguru import logger
from typing import Union, List, Dict
from tempfile import TemporaryDirectory

from utils.types import NLPType
from utils.bigquery.big_query_helper import BigQueryHelper as bqh
from utils.bigquery.get_bigquery_client import get_bigquery_client
from utils.bigquery.get_bigquery_credentials import main as get_bigquery_credentials
from utils.utils import get_file_path_relative, clean_folder, normalize_filename, original_filename 
from utils.variables import bucket_name, dataset_length, data_folder, raw_data_file_name, datasets_folder, related_library_prediction_data_folder, credentials_file

s3_client = boto3.client('s3')


def get_values_concat(input_dictionary: Dict[str, List[str]]) -> List[str]:
    """
    flatten dictionary to list of strings
    """
    return_list: List[str] = []
    for value in input_dictionary.values():
        return_list.extend(value)
    return return_list
    
def load_data(dataset_length: int = dataset_length, batch_size: int = 1000) -> pd.DataFrame:
    assert batch_size % 1000 == 0
    
    # get the biqquery client
    client = get_bigquery_client(NLPType.related_library_prediction)
    
    # grab the helper
    database = bqh(active_project="bigquery-public-data",
               dataset_name="github",
               client=client)
               

    # create output and temp locations
    folder_name: str = related_library_prediction_data_folder
    
    output_folder: str = get_file_path_relative(
        os.path.join(data_folder, datasets_folder, folder_name)    
    )
    output_path: str = os.path.join(output_folder, f'{raw_data_file_name}.tgz')
    
    with tarfile.open(output_path, 'w:gz') as tar:
        with TemporaryDirectory(prefix='rlp_processing_') as temp_dir:
            
            # initialize progress bar
            pbar = tqdm(total=dataset_length)
            # for eatch batch in the dataset
            for i in range(0, dataset_length, batch_size):
                
                # initialize the keys
                filecontent_key: str = "content"
                id_key: str = "id"
                filename_key: str = "filename"
                file_extension_regex: str = ".java"
                
                assert file_extension_regex.startswith(".")
                
                query: str = f"""
                #
                SELECT
                {filecontent_key}, {id_key}, REGEXP_EXTRACT(sample_path,"[A-Z a-z 0-9]+\\\\{file_extension_regex}") {filename_key}
                FROM
                `bigquery-public-data.github_repos.sample_contents`
                WHERE sample_path LIKE '%{file_extension_regex}'
                ORDER BY 
                    id desc
                LIMIT
                    {batch_size}
                OFFSET
                    {i};
                """
                
                frame: pd.DataFrame = database.query_to_pandas(query)
        
                for row in frame.iterrows():
                    filename = row[1][filename_key]
                    content = row[1][filecontent_key]
                    file_id = row[1][id_key]
                    
                    if filename is None or content is None or file_id is None:
                        pbar.update(1)
                        continue
                    
                    archive_name: str = normalize_filename(filename, file_id)
                    temp_file_path: str = os.path.join(temp_dir, archive_name)
                    with open(temp_file_path, "w") as outfile:
                        outfile.write(content)
                    tar.add(temp_file_path, arcname=archive_name)
                    
                    pbar.update(1)
            logger.debug("Finished querying files... ")
            logger.debug(f"Tar file should now close at {output_path}")
    pbar.close()
    
    return frame
    
def main() -> None:
    """
    main dataload function
    """
    logger.info("\n\nInitiating Data Load\n")

    imports_frame: pd.DataFrame = load_data()

    logger.info("\nMETADATA:\n" + str(imports_frame.dtypes))
    logger.info(f"Number of rows per batch: {len(imports_frame)}")
    logger.info('\n' + str(imports_frame.sample(5, replace=True)) + '\n')
    logger.success("\n\nData Load Complete\n")

if __name__ == "__main__":
    main()