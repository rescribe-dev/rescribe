#!/usr/bin/env python3
"""
global variables
"""
from shared.load_model_from_tfhub import load_model_from_tfhub

clean_data_folder: str = '../clean_data'
model_input_path: str = '.model_inputs'
bert_path: str = "https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1"
bert_layer, bert_tokenizer = load_model_from_tfhub(bert_path)
max_sequence_length: int = 64
model_dir: str = "saved_model"
tarfile_path: str = 'model_inputs.tar.gz'
holdout: float = 0.2
