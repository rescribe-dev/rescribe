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

    # In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
    # See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    # We rethrow the exception by default.

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as err:
        raise err
    else:
        # Decrypts secret using the associated KMS CMK.
        # Depending on whether the secret is a string or binary, one of these fields will be populated.
        secret_string_key: str = 'SecretString'
        if secret_string_key not in get_secret_value_response:
            raise ValueError('cannot find secret string for bigquery')
    return get_secret_value_response[secret_string_key]
