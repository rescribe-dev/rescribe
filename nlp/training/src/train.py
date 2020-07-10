#!/usr/bin/env python3
"""
train
"""

import pickle
from typing import List, Any
import tensorflow as tf
from tensorflow.keras.layers import Input, Dense, Layer
from tensorflow.keras.models import Model
from tensorflow.keras.metrics import Metric
import numpy as np
from shared.list_files import list_files
from shared.load_model_from_tfhub import load_model_from_tfhub
from shared.variables import bert_path, model_dir


def build_model_fully_connected(bert_layer: Layer, num_categories: int, max_sequence_length: int = 64) -> Model:
    """add a pretrained bert model as a keras layer"""
    input_word_ids: Input = Input(
        (max_sequence_length,), dtype=tf.int32, name='input_word_ids')
    input_masks: Input = Input(
        (max_sequence_length,), dtype=tf.int32, name='input-masks')
    input_segments: Input = Input(
        (max_sequence_length,), dtype=tf.int32, name='input_segments')
    _, sout = bert_layer([input_word_ids, input_masks, input_segments])
    x_1: Dense = Dense(
        int(1.2 * num_categories), activation='relu')(sout)
    x_2: Layer = tf.keras.layers.GlobalAveragePooling1D()(x_1)
    output_: Dense = Dense(
        int(num_categories), activation='sigmoid', name='output')(x_2)

    model: Model = Model(
        [input_word_ids, input_masks, input_segments], output_)

    print(model.summary())

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
    print(model.summary())
    return model


def train_model_fullyconnected(bert_layer: Layer, bert_inputs: List[tf.Tensor], ytr: np.ndarray, validation_data: tuple,
                               epochs: int, batch_size: int, num_categories: int, max_sequence_length: int,
                               metrics: List[Metric], optimizer: str = 'adam', loss: str = 'binary_crossentropy') -> Any:
    """
    train model fullyconnected
    """
    model: Model = build_model_fully_connected(
        bert_layer, num_categories, max_sequence_length)
    model.compile(optimizer=optimizer, loss=loss, metrics=metrics)
    history: tf.keras.callbacks.History = model.fit(bert_inputs, ytr, validation_data=validation_data,
                                                    epochs=epochs, batch_size=batch_size)
    return model, history


def main():
    """
    main training function for handling batched training
    """
    model_input_path: str = ".model_inputs"
    bert_layer, _bert_tokenizer = load_model_from_tfhub(bert_path)

    # TODOa - get files from s3

    with open(f"{model_input_path}/classification_labels.pkl", 'rb') as pickle_file:
        classification_labels: List[str] = pickle.load(pickle_file)

    num_categories = len(classification_labels)
    files: List[str] = list_files(model_input_path, "pkl")
    assert len(files) % 3 == 1
    n: int = int(len(files) / 3)

    for index in range(n):
        try:
            with open(f"{model_input_path}/model_inputs{index}.pkl", 'rb') as pickle_file:
                bert_inputs: List[tf.Tensor]
                test_inputs: List[tf.Tensor]
                [bert_inputs, test_inputs] = pickle.load(pickle_file)
            with open(f"{model_input_path}/raw_bert_outputs{index}.pkl", 'rb') as pickle_file:
                _xtr_bert: np.ndarray
                _xte_bert: np.ndarray
                [_xtr_bert, _xte_bert] = pickle.load(pickle_file)
            with open(f"{model_input_path}/data_labels{index}.pkl", 'rb') as pickle_file:
                ytr: np.ndarray
                yte: np.ndarray
                [ytr, yte] = pickle.load(pickle_file)
        except BaseException:
            print("cannot load model input data")

        print(type(ytr))
        print(ytr)
        if index != 0:
            try:
                model: Model = tf.keras.models.load_model(f"{model_dir}/")
            except (FileNotFoundError, FileExistsError):
                print("error loading model from disk")
                break
            history: tf.keras.callbacks.History = model.fit(
                bert_inputs, ytr, validation_data=(test_inputs, yte), epochs=1, batch_size=32)
            model.save(f"{model_dir}/")
            print(history.history)
            continue

        model, history = train_model_fullyconnected(bert_layer, bert_inputs, ytr, validation_data=(test_inputs, yte),
                                                    epochs=3, batch_size=32, num_categories=num_categories,
                                                    max_sequence_length=64, metrics=[tf.keras.metrics.AUC(),
                                                                                     tf.keras.metrics.FalsePositives(),
                                                                                     tf.keras.metrics.Recall(),
                                                                                     tf.keras.metrics.Precision(),
                                                                                     tf.keras.metrics.TruePositives()])
        model.save(f"{model_dir}/")
        print(history.history)


if __name__ == '__main__':
    main()
