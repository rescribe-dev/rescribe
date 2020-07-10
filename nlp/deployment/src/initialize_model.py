#!/usr/bin/env python3
"""
Load in the bert model from disk
"""
from os.path import exists, basename
import tensorflow as tf
import tarfile
from typing import Union
from config import PRODUCTION
from tensorflow.keras.models import Model
import boto3
from shared.utils import get_file_path_relative
from shared.variables import model_output_dir, tarfile_model_output_dir, bucket_name

nlp_model: Union[Model, None] = None

s3 = boto3.client('s3')


def main():
    """
    Load the most recent bert model in from disk
    """
    global nlp_model

    tar_input_path_abs = get_file_path_relative(tarfile_model_output_dir)
    if PRODUCTION and not exists(tar_input_path_abs):
        filename = basename(tar_input_path_abs)
        with open(filename, 'wb') as file:
            s3.download_fileobj(bucket_name, tar_input_path_abs, file)

    model_abs = get_file_path_relative(model_output_dir)

    with tarfile.open(tar_input_path_abs) as tar:
        tar.extractall(model_abs)

    if not exists(model_abs):
        if not PRODUCTION:
            raise ValueError('cannot find model files')

    nlp_model = tf.keras.models.load_model(model_abs)
