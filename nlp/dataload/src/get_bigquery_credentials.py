#!/usr/bin/env python3
"""
get bigquery credentials
"""
from boto3.session import Session
from botocore.exceptions import ClientError

secret_name: str = 'BIGQUERY_CREDENTIALS'
region_name: str = 'us-east-1'


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

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as err:
        raise err

    secret_string_key: str = 'SecretString'
    if secret_string_key not in get_secret_value_response:
        raise ValueError('cannot find secret string for bigquery')
    value: str = get_secret_value_response[secret_string_key]
    if len(value) == 0:
        raise ValueError('no credential value found')
    return value
