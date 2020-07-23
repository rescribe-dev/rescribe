#!/usr/bin/env python3
"""
retrieve input in BERT Format
"""

from typing import List
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from transformers import BertTokenizer
from pandas import DataFrame


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


def get_inputs(dataframe: DataFrame, _maxlen: int, tokenizer: BertTokenizer) -> List[tf.Tensor]:
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
