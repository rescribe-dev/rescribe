#!/usr/bin/env python3
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
                if str(elem).endswith('src'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

from os import getenv, remove, makedirs
from os.path import exists, basename, join, dirname, splitext
from shutil import rmtree
from typing import Union, List, Dict
from pandas import DataFrame
from loguru import logger
from tqdm import tqdm
import boto3
from load.bigquery.big_query_helper import BigQueryHelper as bqh
from load.bigquery.get_bigquery_credentials import main as get_bigquery_credentials
from shared.utils import get_file_path_relative
from glob import glob
from load.bigquery.get_bigquery_credentials import create_bigquery_client
from shared.config import PRODUCTION
from shared.type import NLPType
from shared.variables import bucket_name, dataset_length as default_dataset_length, \
    data_folder, main_data_file, \
    datasets_folder, type_path_dict
from math import floor

credentials_file: str = 'load/bigquery/bigquery_credentials.json'

s3_client = boto3.client('s3')


def get_values_concat(input_dictionary: Dict[str, List[str]]) -> List[str]:
    """
    flatten dictionary to list of strings
    """
    return_list: List[str] = []
    for value in input_dictionary.values():
        return_list.extend(value)
    return return_list


def sanitize_regex_str(input_str: str) -> str:
    """
    sanitize regex bigquery string
    """
    return input_str.replace('+', '\\+')


def get_storage_formatted_name(filename: str, file_id: str) -> str:
    """
    Given a filename and fileID from GitHub's dataset, get the path under which the file should be
    saved. Note that it will be impossible to get the original filename back if the extension has
    an underscore in it
    Input: file.java  Id: 1234
    Output: file_java_1234.java
    """
    split_filename = splitext(filename)
    file_name_no_extension: str = split_filename[0]
    file_extension: str = split_filename[1].replace('.', '')

    output_file_name_components_no_extension: str = [
        file_name_no_extension, file_extension, file_id]

    output_file_name_no_extension: str = '_'.join(
        output_file_name_components_no_extension)

    new_file_name: str = f"{output_file_name_no_extension}.{file_extension}"
    return new_file_name


# TODO - write this function
# def get_original_file_info(storage_filename: str):
#      pass


def setup_output_folder(output_folder_path: str, delete_old_data=False) -> None:
    """
    If delete_old_data, then delete the folder; regardless, make sure the output directory exists.
    """
    if delete_old_data and not exists(dirname(output_folder_path)):
        rmtree(output_folder_path)

    if not exists(dirname(output_folder_path)):
        makedirs(dirname(output_folder_path))


def dataload(dataload_type: NLPType, dataset_length: int = default_dataset_length, batch_size: int = 1000) -> DataFrame:
    """
    Dataload: Submit sql queries to bigquery for java files and write them to disk. Note that this
    does not necessarily save out dataset_length number of queries to disk, but can save fewer if
    there are errors or Nones returned from the sql query
    """
    assert(batch_size % 1000 == 0)
    # The dataset size is in multiples of 1000
    folder_name: str = type_path_dict[dataload_type]

    client = create_bigquery_client(dataload_type)

    data = bqh(active_project="bigquery-public-data",
               dataset_name="github",
               client=client)

    data_folder_path = get_file_path_relative(
        f'{data_folder}/{datasets_folder}/{folder_name}')

    setup_output_folder(data_folder_path)

    pbar = tqdm(total=dataset_length)
    for i in range(0, dataset_length, batch_size):
        filecontent_col_title: str = "content"
        id_col_title: str = "id"
        filename_col_title: str = "filename"
        file_extension: str = ".java"
        assert(file_extension.startswith("."))  # If not, this will break...

        query: str = f"""
        #
        SELECT
        {filecontent_col_title}, {id_col_title}, REGEXP_EXTRACT(sample_path,"[A-Z a-z 0-9]+\\\\{file_extension}") {filename_col_title}
        FROM
        `bigquery-public-data.github_repos.sample_contents`
        WHERE sample_path LIKE '%{file_extension}'
        ORDER BY 
            id desc
        LIMIT
            {batch_size}
        OFFSET
            {i};
        """

        dumped_dataframe: DataFrame = data.query_to_pandas(query)
        for row in dumped_dataframe.iterrows():
            filename = row[1][filename_col_title]
            content = row[1][filecontent_col_title]
            file_id = row[1][id_col_title]
            if(filename is None or content is None or file_id is None):
                continue
            with open(f"{data_folder_path}/{get_storage_formatted_name(filename, file_id)}", 'w') as outfile:
                outfile.write(content)
            pbar.update(1)
    pbar.close()

    return dumped_dataframe


def main(dataload_type: NLPType):
    """
    main dataload function
    """
    logger.info("\n\nInitiating Data Load\n")

    imports_frame: DataFrame = dataload(dataload_type)

    logger.info("\nMETADATA:\n" + str(imports_frame.dtypes))
    logger.info(f"Number of rows per batch: {len(imports_frame)}")
    logger.info('\n' + str(imports_frame.sample(5)) + '\n')
    logger.success("\n\nData Load Complete\n")


if __name__ == '__main__':
    main(NLPType.library_analysis)
