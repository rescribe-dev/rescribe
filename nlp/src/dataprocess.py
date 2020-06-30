#!/usr/bin/env python3
"""
data processing
"""
from os import listdir, mkdir
import pickle
import tensorflow_hub as hub
import bert
from transformers import BertTokenizer
import pandas as pd
import numpy as np
import gc
from _get_inputs import _get_inputs
from list_files import list_files



# very important - use only this bert version in tfhub since its tf2 compatible
# all the instructions are available in the same page
# https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1
clean_data_folder: str = '../clean_data'
model_input_path: str = '.model_inputs'
bert_path: str = "https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1"
max_seq_length = 64
holdout = 0.2


# def dataprocess(clean_data_folder: str, model_input_path: str, bert_path: str, max_seq_length: int, holdout: int):

bert_layer = hub.KerasLayer(bert_path, trainable=True)
vocab_file1 = bert_layer.resolved_object.vocab_file.asset_path.numpy()
bert_tokenizer_tfhub = bert.bert_tokenization.FullTokenizer(
    vocab_file1, do_lower_case=True)
bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

try:
    mkdir(f"{model_input_path}")
except FileExistsError:
    pass

files = list_files(f"{clean_data_folder}/", "csv")
for file_name in files:
    index: int = int(file_name.split('.')[0])
    data_frame: pd.DataFrame = pd.read_csv(f"{clean_data_folder}/{file_name}")
    labels = data_frame.drop(columns=["__title__"])
    train = data_frame.iloc[:int(len(data_frame) * (1 - holdout))]
    test = data_frame.iloc[int(len(data_frame) * (1 - holdout)):]
    labels_train = labels[:int(len(labels) * (1 - holdout))]
    labels_test = labels[int(len(data_frame) * (1 - holdout)):]

    bert_inputs = _get_inputs(
        dataframe=train, tokenizer=bert_tokenizer, _maxlen=max_seq_length)
    test_inputs = _get_inputs(
        dataframe=test, tokenizer=bert_tokenizer, _maxlen=max_seq_length)

    print(file_name)
    print(index)
    _, Xtr_bert = bert_layer(bert_inputs)
    ytr = labels_train
    _, Xte_bert = bert_layer(test_inputs)
    yte = labels_test

    Xtr_bert = np.asarray(Xtr_bert)
    ytr = np.asarray(ytr)
    Xte_bert = np.asarray(Xte_bert)
    yte = np.asarray(yte)

    model_inputs = [bert_inputs, test_inputs, Xtr_bert, Xte_bert, ytr, yte]

    with open(f"{model_input_path}/{index}.pkl", 'w') as file:
        pickle.dumps(model_inputs)
gc.collect()

