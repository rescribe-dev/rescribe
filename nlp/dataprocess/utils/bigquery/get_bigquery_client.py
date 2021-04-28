"""
Manages the bigquery client and credentials loading/setup
"""
from os import getenv
from typing import Union
from os.path import exists
from google.cloud import bigquery

from utils.types import NLPType
from utils.variables import credentials_file
from utils.utils import get_file_path_relative
from .get_bigquery_credentials import main as get_bigquery_credentials


def get_bigquery_client(nlp_type: NLPType) -> bigquery.Client:
    """
    Sets up a bigquery client with the credentials
    """

    from utils.config import PRODUCTION

    credentials_file_path = get_file_path_relative(f"dataprocess/{credentials_file}")
    if not exists(credentials_file_path):
        environment_data: Union[str, None] = getenv("BIGQUERY_CREDENTIALS")
        if environment_data is None:
            if not PRODUCTION:
                raise ValueError(
                    f"cannot find big query credentials. Expected at:\n{credentials_file_path}"
                )
            environment_data = get_bigquery_credentials()
        with open(credentials_file_path, "w") as credentials_file_object:
            credentials_file_object.write(environment_data)
    client: bigquery.Client = bigquery.Client.from_service_account_json(
        credentials_file_path
    )

    return client
