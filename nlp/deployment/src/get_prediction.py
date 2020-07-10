#!/usr/bin/env python3
"""
Take a string and return the bert prediction for it
"""


from typing import List, Dict, Union, cast
import pickle
from pandas import DataFrame
import tensorflow as tf
from transformers import BertTokenizer
from shared.variables import max_sequence_length, model_input_path, bert_path
from shared.get_inputs import get_inputs
from shared.utils import get_file_path_relative
from shared.load_model_from_tfhub import load_model_from_tfhub
from initialize_model import nlp_model

classification_labels_data: Union[List[str], None] = None

_bert_layer, bert_tokenizer = load_model_from_tfhub(bert_path)


def initialize_classification_labels():
    """
    initialize classification labels
    """
    global classification_labels_data
    try:
        with open(get_file_path_relative(f"../src/{model_input_path}/classification_labels.pkl"), 'rb') as \
                pickle_file:
            classification_labels_data = pickle.load(pickle_file)
    except FileNotFoundError:
        raise FileNotFoundError(
            "Cannot find the classification labels pickle file")


def generate_bert_input(input_string: str, maxlen: int = max_sequence_length,
                        tokenizer: BertTokenizer = bert_tokenizer) -> List[tf.Tensor]:
    """
    Take a string and generate the appropriate input to our nlp system
    """

    data: Dict = {'__title__': [input_string]}
    data_frame: DataFrame = DataFrame(data, columns=["__title__"])

    return get_inputs(data_frame, tokenizer=tokenizer, _maxlen=maxlen)


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
