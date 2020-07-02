#!/usr/bin/env python3
"""
Take a string and return the bert prediction for it
"""


from typing import List, Dict, Union, cast
import pickle
import pandas as pd
import tensorflow as tf
from transformers import BertTokenizer
from dataprocess import _get_inputs
from variables import bert_tokenizer, max_sequence_length, model_input_path
from initialize_model import nlp_model

classification_labels_data: Union[List[str], None] = None


def initialize_classification_labels():
    """
    initialize classification labels
    """
    global classification_labels_data
    try:
        with open(f"{model_input_path}/classification_labels.pkl", 'rb') as pickle_file:
            classification_labels_data: List[str] = pickle.load(pickle_file)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Cannot find the classfication labels pickle file at {model_input_path}/classification_labels.pkl")


def generate_bert_input(input_string: str, maxlen: int = max_sequence_length,
                        tokenizer: BertTokenizer = bert_tokenizer) -> List[tf.Tensor]:
    """
    Take a string and generate the appropriate input to our nlp system
    """

    data: Dict = {'__title__': [input_string]}
    data_frame: pd.DataFrame = pd.DataFrame(data, columns=["__title__"])

    return _get_inputs(data_frame, tokenizer=tokenizer, _maxlen=maxlen)


def main(input_string: str, _threshold: float = 0.2, top: int = 2) -> List[str]:
    """
    return the top tags from the bert NLP model for the input string
    """

    bert_input: List[tf.Tensor] = generate_bert_input(input_string)

    if nlp_model is None:
        raise ValueError('nlp model is not initialized')
    if classification_labels_data is None:
        raise ValueError('label names is not initialized')
    classification_labels_data_defined = cast(
        List[str], classification_labels_data)

    prediction: List[List[str]] = nlp_model.predict(bert_input)
    sorted_predictions: List[int] = sorted(
        range(len(prediction[0])), key=lambda i: prediction[0][i])[-top:]
    if sorted_predictions is None:
        raise ValueError("too few model predictions")

    return list(map(lambda i: classification_labels_data_defined[i], sorted_predictions))
