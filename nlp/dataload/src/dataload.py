#!/usr/bin/env python3
"""
load data into post questions
"""
from os import getenv
from os.path import exists
from config import PRODUCTION
from pandas import DataFrame
from loguru import logger
from typing import Union
from google.cloud import bigquery
from big_query_helper import BigQueryHelper as bqh
import boto3
from get_bigquery_credentials import main as get_bigquery_credentials
from io import StringIO
from shared.utils import get_file_path_relative
from shared.variables import questions_file, bucket_name

credentials_file: str = '../../bigquery_credentials.json'


def dataload(dataset_length: int) -> DataFrame:
    """
    externally callable version of the main dataload function
    """
    file_path = get_file_path_relative(credentials_file)
    if not exists(file_path):
        environment_data: Union[str, None] = getenv('BIGQUERY_CREDENTIALS')
        if environment_data is None:
            if not PRODUCTION:
                raise ValueError('cannot find big query credentials')
            environment_data = get_bigquery_credentials()
        with open(file_path, 'w') as credentials_file_object:
            credentials_file_object.write(environment_data)
    client: bigquery.Client = bigquery.Client.from_service_account_json(
        get_file_path_relative(credentials_file))

    data = bqh(active_project="bigquery-public-data",
               dataset_name="stackoverflow",
               client=client)

    # Ok, so what we want are the query titles, the query descriptions,
    # the code from the top answer, and the tags associated with it
    # Note: individual tables in this dataset blow past 30 gigs

    query: str = f"""
    SELECT 
        id, title, tags
    FROM 
        bigquery-public-data.stackoverflow.posts_questions
    WHERE accepted_answer_id IS NOT NULL AND tags IS NOT NULL
    LIMIT {dataset_length}
    """
    questions: DataFrame = data.query_to_pandas(query)
    questions.to_csv(get_file_path_relative(questions_file))

    if PRODUCTION:
        csv_buffer = StringIO()
        questions.to_csv(csv_buffer)
        s3_resource = boto3.resource('s3')
        s3_resource.Object(
            bucket_name, 'post-questions.csv').put(Body=csv_buffer.getvalue())

    return questions


def main():
    """
    main dataload function
    """
    dataset_length: int = 2000
    questions: DataFrame = dataload(dataset_length)

    logger.info("\nMETADATA:\n" + str(questions.dtypes))
    logger.info(f"Number of rows: {len(questions)}")
    logger.info('\n' + str(questions.sample(5)) + '\n')


if __name__ == '__main__':
    main()
