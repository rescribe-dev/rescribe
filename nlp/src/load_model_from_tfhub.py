#!/usr/bin/env python3
"""
contains a fuction to load a pretrained model from tfhub
"""
import tensorflow_hub as hub
from tensorflow.keras.layers import Layer
from transformers import BertTokenizer
from typing import Any


def load_model_from_tfhub(bert_path: str) -> Any:
    """
    load model from tfhub
    """
    bert_layer: Layer = hub.KerasLayer(bert_path, trainable=True)
    # vocab_file1 = bert_layer.resolved_object.vocab_file.asset_path.numpy()
    # _bert_tokenizer_tfhub: bert.bert_tokenization.FullTokenizer = bert.bert_tokenization.FullTokenizer(
    #     vocab_file1, do_lower_case=True)
    bert_tokenizer: BertTokenizer = BertTokenizer.from_pretrained(
        'bert-base-uncased')
    return bert_layer, bert_tokenizer
