#!/usr/bin/env python3
"""
data processing
"""
from os import mkdir
from os.path import basename
import pickle
import gc
import tarfile
from typing import List
import pandas as pd
import numpy as np
import tensorflow as tf
from loguru import logger
import boto3
from config import PRODUCTION
from shared.utils import list_files, get_file_path_relative
from shared.variables import clean_data_folder, model_input_path, \
    max_sequence_length, holdout, tarfile_path_model_inputs, bert_path, bucket_name
from shared.get_inputs import get_inputs
from shared.load_model_from_tfhub import load_model_from_tfhub


def main():
    """
    dataprocess main function
    """
    # very important - use only this bert version in tfhub since its tf2 compatible
    # all the instructions are available in the same page
    # https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1
    max_seq_length: int = max_sequence_length

    bert_layer, bert_tokenizer = load_model_from_tfhub(bert_path)

    try:
        mkdir(get_file_path_relative(model_input_path))
    except FileExistsError:
        pass

    files: List[str] = list_files(
        get_file_path_relative(f'{clean_data_folder}/'), "csv")
    for file_name in files:
        index: int = int(file_name.split('.')[0])
        data_frame: pd.DataFrame = pd.read_csv(
            get_file_path_relative(f"{clean_data_folder}/{file_name}"), index_col=None)
        labels: pd.DataFrame = data_frame.drop(
            columns=["__title__", "__tags__"])
        train: pd.DataFrame = data_frame.iloc[:int(
            len(data_frame) * (1 - holdout))]
        test: pd.DataFrame = data_frame.iloc[int(
            len(data_frame) * (1 - holdout)):]
        labels_train: pd.DataFrame = labels[:int(len(labels) * (1 - holdout))]
        labels_test: pd.DataFrame = labels[int(
            len(data_frame) * (1 - holdout)):]

        bert_inputs: List[tf.Tensor] = get_inputs(
            dataframe=train, tokenizer=bert_tokenizer, _maxlen=max_seq_length)
        test_inputs: List[tf.Tensor] = get_inputs(
            dataframe=test, tokenizer=bert_tokenizer, _maxlen=max_seq_length)

        logger.info(f'creating {file_name}')
        _, xtr_bert = bert_layer(bert_inputs)
        ytr: pd.DataFrame = labels_train
        _, xte_bert = bert_layer(test_inputs)
        yte: pd.DataFrame = labels_test

        xtr_bert: np.ndarray = np.asarray(xtr_bert)
        ytr: np.ndarray = np.asarray(ytr)
        xte_bert: np.ndarray = np.asarray(xte_bert)
        yte: np.ndarray = np.asarray(yte)

        model_inputs: List[List[tf.Tensor]] = [bert_inputs, test_inputs]
        raw_bert_outputs: List[np.ndarray] = [xtr_bert, xte_bert]
        data_labels: List[np.ndarray] = [ytr, yte]
        with open(get_file_path_relative(f"{model_input_path}/model_inputs{index}.pkl"), 'wb') as pickle_file:
            pickle.dump(model_inputs, pickle_file)
        with open(get_file_path_relative(f"{model_input_path}/raw_bert_outputs{index}.pkl"), 'wb') as pickle_file:
            pickle.dump(raw_bert_outputs, pickle_file)
        with open(get_file_path_relative(f"{model_input_path}/data_labels{index}.pkl"), 'wb') as pickle_file:
            pickle.dump(data_labels, pickle_file)
    gc.collect()

    tarfile_path_model_inputs_abs = get_file_path_relative(
        tarfile_path_model_inputs)
    with tarfile.open(tarfile_path_model_inputs_abs, "w:gz") as tar:
        # arcname makes the tarfile contain a directory with the same name as model_input_path,
        # use os.path.sep for the tarfile to contain the contents themselves
        tar.add(get_file_path_relative(model_input_path),
                arcname=basename(model_input_path))

    if PRODUCTION:
        boto3.resource('s3').Bucket(bucket_name).upload_file(
            tarfile_path_model_inputs_abs, basename(tarfile_path_model_inputs_abs))


if __name__ == '__main__':
    main()
