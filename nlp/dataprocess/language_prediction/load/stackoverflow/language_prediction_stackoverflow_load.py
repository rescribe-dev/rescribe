#!/usr/bin/env python
"""
load data into post questions
"""

import os
import boto3
import pandas as pd
from typing import List

from loguru import logger
from google.cloud import bigquery

#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file = Path(__file__).resolve()
    root = next(
        elem for elem in current_file.parents if str(elem).endswith("dataprocess")
    )
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

from utils.types import NLPType
from utils.languages import languages
from utils.bigquery.big_query_helper import BigQueryHelper as bqh
from utils.bigquery.get_bigquery_client import get_bigquery_client
from utils.utils import (
    get_file_path_relative,
    clean_folder,
    save_to_disk,
    get_values_concat,
    clean_regex_str,
)
from utils.variables import (
    bucket_name,
    data_folder,
    datasets_folder,
    language_prediction_data_folder,
    raw_data_file_name,
    compression_extension,
    dataset_length,
)


s3_client = boto3.client("s3")


def load_data(query_len_limit: int = dataset_length) -> pd.DataFrame:
    """
    Get the data from BigQuery and return in a pandas dataframe
    - id, title, tags are queried
    """
    from utils.config import PRODUCTION

    # retrieve the Bigquery Helper
    client: bigquery.Client = get_bigquery_client(NLPType.language_prediction)

    database: bqh = bqh(
        active_project="bigquery-public-data",
        dataset_name="stackoverflow",
        client=client,
    )

    # Build the SQL query
    tag_matching: List[str] = get_values_concat(languages)

    tags_regex: str = clean_regex_str(
        "|".join(map(lambda tag: tag + "[\\||$]", tag_matching))
    )

    # Only select tagged & answered questions in our query
    conditional: str = f'accepted_answer_id IS NOT NULL AND tags IS NOT NULL AND REGEXP_CONTAINS(tags, r"({tags_regex})")'

    query: str = f"""
    SELECT 
        id, title, tags
    FROM 
        bigquery-public-data.stackoverflow.posts_questions
    WHERE {conditional}
    LIMIT {query_len_limit}
    """

    dataset: pd.DataFrame = database.query_to_pandas(query)

    # Determine output path and clean any existing data held within
    folder_name: str = language_prediction_data_folder
    output_folder: str = get_file_path_relative(
        f"{data_folder}/{datasets_folder}/{folder_name}"
    )
    clean_folder(output_folder, "*")

    output_path = os.path.join(
        output_folder, f"{raw_data_file_name}.{compression_extension}"
    )

    # Save new data to output folder
    logger.info(f"Writing to Local Disk - {output_path}")

    save_to_disk({raw_data_file_name: dataset}, output_path, compression_extension)
    print(os.path.basename(output_path))
    if PRODUCTION:
        s3_client.upload_file(dataset, bucket_name, os.path.basename(output_path))

    return dataset


@logger.catch
def main() -> pd.DataFrame:
    """
    Load data from StackOverflow BigQuery dataset. No return.
    """
    dataset: pd.DataFrame = load_data()

    logger.info("\nMETADATA:\n" + str(dataset.dtypes))
    logger.info(f"Number of rows: {len(dataset)}")
    logger.info("\n" + str(dataset.sample(5, replace=True)) + "\n")
    logger.success("\n\nData Load Complete\n")
    return dataset


if __name__ == "__main__":
    main()
