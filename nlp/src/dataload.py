#!/usr/bin/env python3
"""
load data into post questions
"""
from os.path import abspath, dirname, join
from pandas import DataFrame
from google.cloud import bigquery
from big_query_helper import BigQueryHelper as bqh

credentials_file: str = '../bigquery_credentials.json'
questions_output: str = '../datasets/post-questions.csv'


def dataload(dataset_length: int) -> DataFrame:
    """
    externally callable version of the main dataload function
    """
    client: bigquery.Client = bigquery.Client.from_service_account_json(
        abspath(join(dirname(__file__), credentials_file)))

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

    questions.to_csv(abspath(join(dirname(__file__), questions_output)))

    return questions


def main():
    """
    main dataload function
    """
    dataset_length: int = 2000
    questions: DataFrame = dataload(dataset_length)

    print("\nMETADATA\n")
    print(questions.dtypes)
    print(f"Number of rows: {len(questions)}\n")
    print(questions.sample(5))
    print('\n')


if __name__ == '__main__':
    main()
