#!/usr/bin/env python3
"""
data processing
"""
from os import mkdir
import pickle
import gc
import pandas as pd
import numpy as np
from typing import List
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from list_files import list_files
from load_model_from_tfhub import load_model_from_tfhub
from transformers import BertTokenizer
from variables import clean_data_folder, model_input_path, bert_path


def _get_segments(sentences: List[List[str]]) -> List[List[int]]:
    """
    gets sentence segments
    """
    sentences_segments: List[List[int]] = []
    for sent in list(sentences):
        temp: List[int] = []
        i: int = 0
        for token in sent:
            temp.append(i)
            if token == "[SEP]":
                i += 1
        sentences_segments.append(temp)
    return sentences_segments


def _get_inputs(dataframe: pd.DataFrame, _maxlen: int, tokenizer: BertTokenizer) -> List[tf.Tensor]:
    """
    get inputs
    """
    # titles is a list of the question titles
    titles_temp: List[str] = dataframe["__title__"].values.tolist()
    titles: List[str] = ["[CLS] " +
                         title.lower() + " [SEP]" for title in titles_temp]
    titles_padded_temp: List[List[str]] = [
        tokenizer.tokenize(title) for title in titles]
    # titles mask is the bitmask for the titles padded out to the _maxlen
    titles_mask: List[List[int]] = [
        [1] * len(title) + [0] * (_maxlen - len(title)) for title in titles_padded_temp]
    titles_padded: List[List[str]] = pad_sequences(
        titles_padded_temp, dtype=object, maxlen=_maxlen, value='[PAD]', padding='post')
    titles_segment: List[List[int]] = _get_segments(titles_padded)
    titles_converted: List[List[int]] = [tokenizer.convert_tokens_to_ids(
        title) for title in titles_padded]
    return [tf.cast(titles_converted, tf.int32),
            tf.cast(titles_segment, tf.int32), tf.cast(titles_mask, tf.int32)]


def main():
    """
    dataprocess main function
    """
    # very important - use only this bert version in tfhub since its tf2 compatible
    # all the instructions are available in the same page
    # https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1
    max_seq_length: int = 64
    holdout: float = 0.2
    # originally duplicated code
    bert_layer, bert_tokenizer = load_model_from_tfhub(bert_path)

    try:
        mkdir(f"{model_input_path}")
    except FileExistsError:
        pass

    files: List[str] = list_files(f"{clean_data_folder}/", "csv")
    for file_name in files:
        index: int = int(file_name.split('.')[0])
        data_frame: pd.DataFrame = pd.read_csv(
            f"{clean_data_folder}/{file_name}", index_col=None)
        labels: pd.DataFrame = data_frame.drop(
            columns=["__title__", "__tags__"])
        train: pd.DataFrame = data_frame.iloc[:int(
            len(data_frame) * (1 - holdout))]
        test: pd.DataFrame = data_frame.iloc[int(
            len(data_frame) * (1 - holdout)):]
        labels_train: pd.DataFrame = labels[:int(len(labels) * (1 - holdout))]
        labels_test: pd.DataFrame = labels[int(
            len(data_frame) * (1 - holdout)):]

        bert_inputs: List[tf.Tensor] = _get_inputs(
            dataframe=train, tokenizer=bert_tokenizer, _maxlen=max_seq_length)
        test_inputs: List[tf.Tensor] = _get_inputs(
            dataframe=test, tokenizer=bert_tokenizer, _maxlen=max_seq_length)

        print(file_name)
        print(index)
        _, xtr_bert = bert_layer(bert_inputs)
        ytr: pd.DataFrame = labels_train
        _, xte_bert = bert_layer(test_inputs)
        yte: pd.DataFrame = labels_test

        xtr_bert: np.ndarray = np.asarray(xtr_bert)
        ytr: np.ndarry = np.asarray(ytr)
        xte_bert: np.ndarray = np.asarray(xte_bert)
        yte: np.ndarray = np.asarray(yte)

        model_inputs: List[List[tf.Tensor]] = [bert_inputs, test_inputs]
        raw_bert_outputs: List[np.ndarray] = [xtr_bert, xte_bert]
        data_labels: List[np.ndarray] = [ytr, yte]

        with open(f"{model_input_path}/model_inputs{index}.pkl", 'wb') as pickle_file:
            pickle.dump(model_inputs, pickle_file)
        with open(f"{model_input_path}/raw_bert_outputs{index}.pkl", 'wb') as pickle_file:
            pickle.dump(raw_bert_outputs, pickle_file)
        with open(f"{model_input_path}/data_labels{index}.pkl", 'wb') as pickle_file:
            pickle.dump(data_labels, pickle_file)
    gc.collect()


if __name__ == '__main__':
    main()
