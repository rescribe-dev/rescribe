#!/usr/bin/env python3
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
                if str(elem).endswith('src'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

from os import getenv, remove
from os.path import exists, basename, join
from typing import Union, List, Dict
from pandas import DataFrame
from loguru import logger
from google.cloud import bigquery
import boto3
from load.bigquery.big_query_helper import BigQueryHelper as bqh
from load.bigquery.get_bigquery_credentials import main as get_bigquery_credentials
from shared.utils import get_file_path_relative
from glob import glob
from shared.variables import bucket_name, dataset_length as default_dataset_length, \
    data_folder, main_data_file, \
    datasets_folder

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


def dataload(dataset_length: int = default_dataset_length) -> DataFrame:
    """
    externally callable version of the main dataload function
    """
    from shared.config import PRODUCTION

    # folder_name: str = language_data_folder if dataload_type == NLPType.language else library_data_folder
    folder_name: str = "library_analysis"

    credentials_file_path = get_file_path_relative(
        f'dataprocess/{folder_name}/src/{credentials_file}')
    if not exists(credentials_file_path):
        environment_data: Union[str, None] = getenv('BIGQUERY_CREDENTIALS')
        if environment_data is None:
            if not PRODUCTION:
                raise ValueError(
                    'cannot find big query credentials in ' + str(credentials_file_path))
            environment_data = get_bigquery_credentials()
        with open(credentials_file_path, 'w') as credentials_file_object:
            credentials_file_object.write(environment_data)
    client: bigquery.Client = bigquery.Client.from_service_account_json(
        credentials_file_path)

    data = bqh(active_project="bigquery-public-data",
               dataset_name="github",
               client=client)

    data_folder_path = get_file_path_relative(
        f'{data_folder}/{datasets_folder}/{folder_name}')

    # delete all datasets
    for file_path in glob(join(data_folder_path, '*.csv')):
        remove(file_path)

    # tag_matching = get_values_concat(
    #     libraries if dataload_type == NLPType.library else languages)
    # tags_regex = sanitize_regex_str(
    #     '|'.join(map(lambda tag: tag + '[\\||$]', tag_matching)))
    # conditional: str = f'accepted_answer_id IS NOT NULL AND tags IS NOT NULL AND REGEXP_CONTAINS(tags, r"({tags_regex})")'

    query: str = f"""
    #
    SELECT
      substr(line, 7) cut_line, id
    FROM
      `bigquery-public-data.github_repos.sample_contents` CROSS JOIN unnest(SPLIT(content, '\\n')) line
    WHERE REGEXP_CONTAINS(content, 'import')
      AND sample_path LIKE '%.java' 
    and substr(line, 1,6)='import'
ORDER BY id desc
LIMIT
  {dataset_length};
    """

    unsanitary_imports_frame: DataFrame = data.query_to_pandas(query)
    imports_list = []
    for j, k in unsanitary_imports_frame.iterrows():
        j = k['cut_line']
        k = k['id']
        # print(str(j) + "\t" + str(k))
        imports_list.append([ (str(j)).strip() , k])
    imports_frame = DataFrame(imports_list)
    questions_file_abs = join(data_folder_path, main_data_file)

    logger.info(f"Writing to Local Disk - {questions_file_abs}")
    imports_frame.to_csv(questions_file_abs)

    if PRODUCTION:
        s3_client.upload_file(
            questions_file_abs, bucket_name, basename(questions_file_abs))

    return imports_frame


def main():
    """
    main dataload function
    """
    logger.info("\n\nInitiating Data Load\n")

    imports_frame: DataFrame = dataload()

    logger.info("\nMETADATA:\n" + str(imports_frame.dtypes))
    logger.info(f"Number of rows: {len(imports_frame)}")
    logger.info('\n' + str(imports_frame.sample(5)) + '\n')
    logger.success("\n\nData Load Complete\n")


if __name__ == '__main__':
    # if len(argv) < 2:
    #     raise ValueError('no nlp type provided')
    main()
