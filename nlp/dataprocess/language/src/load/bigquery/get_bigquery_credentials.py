#!/usr/bin/env python3
"""
get bigquery credentials
"""
from boto3.session import Session
from google.cloud import bigquery
from big_query_helper import get_bigquery_credentials
from shared.type import NLPType
from shared.variables import type_path_dict
secret_name: str = 'BIGQUERY_CREDENTIALS'
region_name: str = 'us-east-1'


def create_bigquery_client(dataload_type: NLPType) -> bigquery.Client:
    folder_name: str = type_path_dict[dataload_type]

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

    return bigquery.Client.from_service_account_json(credentials_file_path)


def main() -> str:
    """
    get bigquery credentials
    """
    # Create a Secrets Manager client
    session = Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    get_secret_value_response = client.get_secret_value(
        SecretId=secret_name
    )

    secret_string_key: str = 'SecretString'
    if secret_string_key not in get_secret_value_response:
        raise ValueError('cannot find secret string for bigquery')
    value: str = get_secret_value_response[secret_string_key]
    if len(value) == 0:
        raise ValueError('no credential value found')
    return value
