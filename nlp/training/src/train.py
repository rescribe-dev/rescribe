#!/usr/bin/env python3
"""
train
"""

import pickle
import tarfile
from typing import List, Any
import tensorflow as tf
from os.path import exists, basename
from tensorflow.keras.layers import Input, Dense, Layer
from tensorflow.keras.models import Model
from tensorflow.keras.metrics import Metric
import numpy as np
from loguru import logger
import boto3
from shared.utils import list_files, get_file_path_relative
from shared.variables import model_output_dir, tarfile_model_output_dir, model_input_path, \
    tarfile_path_model_inputs, bert_path, bucket_name
from shared.load_model_from_tfhub import load_model_from_tfhub

s3_client = boto3.client('s3')


def build_model_fully_connected(bert_input_layer: Layer, num_categories: int, max_sequence_length: int = 64) -> Model:
    """add a pretrained bert model as a keras layer"""

    input_word_ids: Input = Input(
        (max_sequence_length,), dtype=tf.int32, name='input_word_ids')
    input_masks: Input = Input(
        (max_sequence_length,), dtype=tf.int32, name='input-masks')
    input_segments: Input = Input(
        (max_sequence_length,), dtype=tf.int32, name='input_segments')
    _, sout = bert_input_layer([input_word_ids, input_masks, input_segments])
    x_1: Dense = Dense(
        int(1.2 * num_categories), activation='relu')(sout)
    x_2: Layer = tf.keras.layers.GlobalAveragePooling1D()(x_1)
    output_: Dense = Dense(
        int(num_categories), activation='sigmoid', name='output')(x_2)

    model: Model = Model(
        [input_word_ids, input_masks, input_segments], output_)

    logger.info(model.summary())

    return model


def build_model_bertembed(num_categories: int, max_sequence_length: int = 64) -> Model:
    """
    build model bertembed
    """
    # The exponential activation function for our output dense layer is the ideal version
    input_: Input = Input(
        shape=(max_sequence_length, 768), name='bert_encoding')
    x_1: Dense = Dense(int(2 * num_categories),
                       activation='exponential')(input_)
    # x_data = tf.keras.layers.LSTM(int(2*num_categories), return_sequences=True)(x_1)
    x_2: Layer = tf.keras.layers.Dropout(0.3)(x_1)
    x_3: Dense = Dense(
        int(1.4 * num_categories), activation='relu')(x_2)
    x_4: Layer = tf.keras.layers.GlobalAveragePooling1D()(x_3)
    output_ = tf.keras.layers.Dense(
        int(num_categories), activation='sigmoid', name='output')(x_4)
    model: Model = Model(input_, output_)
    logger.info(model.summary())
    return model


def train_model_fullyconnected(bert_input_layer: Layer, bert_inputs: List[tf.Tensor], ytr: np.ndarray, validation_data: tuple,
                               epochs: int, batch_size: int, num_categories: int, max_sequence_length: int,
                               metrics: List[Metric], optimizer: str = 'adam', loss: str = 'binary_crossentropy') -> Any:
    """
    train model fullyconnected
    """
    model: Model = build_model_fully_connected(
        bert_input_layer, num_categories, max_sequence_length)
    model.compile(optimizer=optimizer, loss=loss, metrics=metrics)
    history: tf.keras.callbacks.History = model.fit(bert_inputs, ytr, validation_data=validation_data,
                                                    epochs=epochs, batch_size=batch_size)
    return model, history


def main():
    """
    main training function for handling batched training
    """
    bert_layer, _bert_tokenizer = load_model_from_tfhub(bert_path)

    from config import PRODUCTION

    tar_input_path_abs = get_file_path_relative(tarfile_path_model_inputs)
    if PRODUCTION and not exists(tar_input_path_abs):
        with open(tar_input_path_abs, 'wb') as file:
            s3_client.download_fileobj(
                bucket_name, basename(tar_input_path_abs), file)

    with tarfile.open(tar_input_path_abs) as tar:
        tar.extractall(get_file_path_relative('.'))

    with open(get_file_path_relative(f"{model_input_path}/classification_labels.pkl"), 'rb') as pickle_file:
        classification_labels: List[str] = pickle.load(pickle_file)
    num_categories = len(classification_labels)
    files: List[str] = list_files(
        get_file_path_relative(model_input_path), "pkl")

    assert len(files) % 3 == 1
    n: int = int(len(files) / 3)

    abs_model_output_dir = get_file_path_relative(model_output_dir)

    for index in range(n):
        try:
            with open(get_file_path_relative(f"{model_input_path}/model_inputs{index}.pkl"), 'rb') as pickle_file:
                bert_inputs: List[tf.Tensor]
                test_inputs: List[tf.Tensor]
                [bert_inputs, test_inputs] = pickle.load(pickle_file)
            with open(get_file_path_relative(f"{model_input_path}/raw_bert_outputs{index}.pkl"), 'rb') as pickle_file:
                _xtr_bert: np.ndarray
                _xte_bert: np.ndarray
                [_xtr_bert, _xte_bert] = pickle.load(pickle_file)
            with open(get_file_path_relative(f"{model_input_path}/data_labels{index}.pkl"), 'rb') as pickle_file:
                ytr: np.ndarray
                yte: np.ndarray
                [ytr, yte] = pickle.load(pickle_file)
        except BaseException:
            raise ValueError("cannot load model input data")

        if index != 0:
            try:
                model: Model = tf.keras.models.load_model(abs_model_output_dir)
            except (FileNotFoundError, FileExistsError):
                raise ValueError("error loading model from disk")
            history: tf.keras.callbacks.History = model.fit(
                bert_inputs, ytr, validation_data=(test_inputs, yte), epochs=1, batch_size=32)
            model.save(abs_model_output_dir)
            logger.info(history.history)
            continue

        model, history = train_model_fullyconnected(bert_layer, bert_inputs, ytr, validation_data=(test_inputs, yte),
                                                    epochs=3, batch_size=32, num_categories=num_categories,
                                                    max_sequence_length=64, metrics=[tf.keras.metrics.AUC(),
                                                                                     tf.keras.metrics.FalsePositives(),
                                                                                     tf.keras.metrics.Recall(),
                                                                                     tf.keras.metrics.Precision(),
                                                                                     tf.keras.metrics.TruePositives()])
        model.save(abs_model_output_dir)
        logger.info(history.history)

    tarfile_path_model_output_abs = get_file_path_relative(
        tarfile_model_output_dir)
    tarfile_filename = basename(tarfile_path_model_output_abs)
    with tarfile.open(tarfile_path_model_output_abs, "w:gz") as tar:
        tar.add(abs_model_output_dir, arcname='', recursive=True)

    if PRODUCTION:
        s3_client.upload_file(tarfile_path_model_output_abs,
                              bucket_name, tarfile_filename)


if __name__ == '__main__':
    main()
