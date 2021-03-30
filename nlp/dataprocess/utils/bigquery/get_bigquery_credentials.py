#!/usr/bin/env python
"""
get bigquery credentials
"""
from boto3.session import Session
from loguru import logger
from variables import AWS_BIGQUERY_SECRET_NAME as secret_name
from variables import AWS_SECRET_REGION_NAME as region_name


@logger.catch
def main() -> str:
    """
    get bigquery credentials
    """
    # Create a Secrets Manager client
    session = Session()
    client = session.client(service_name="secretsmanager", region_name=region_name)

    get_secret_value_response = client.get_secret_value(SecretId=secret_name)

    secret_string_key: str = "SecretString"
    if secret_string_key not in get_secret_value_response:
        raise ValueError("cannot find secret string for bigquery")
    value: str = get_secret_value_response[secret_string_key]
    if len(value) == 0:
        raise ValueError("no credential value found")
    return value
