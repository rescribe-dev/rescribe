#!/usr/bin/env python3
"""
Load in the bert model from disk
"""
from os.path import exists, basename
import tensorflow as tf
import tarfile
from typing import Union
from tensorflow.keras.models import Model
import boto3
from shared.utils import get_file_path_relative
from shared.variables import model_output_dir, tarfile_model_output_dir, bucket_name

nlp_model: Union[Model, None] = None

s3_client = boto3.client('s3')


def main():
    """
    Load the most recent bert model in from disk
    """
    global nlp_model

    from config import PRODUCTION

    model_abs = get_file_path_relative(model_output_dir)

    if not exists(model_abs):
        tar_input_path_abs = get_file_path_relative(tarfile_model_output_dir)
        if not exists(tar_input_path_abs):
            if not PRODUCTION:
                raise ValueError('cannot find saved model tar file')
            with open(tar_input_path_abs, 'wb') as file:
                s3_client.download_fileobj(
                    bucket_name, basename(tar_input_path_abs), file)

        with tarfile.open(tar_input_path_abs) as tar:
            tar.extractall(model_abs)

    if not exists(model_abs):
        raise ValueError('cannot find model files')

    nlp_model = tf.keras.models.load_model(model_abs)
