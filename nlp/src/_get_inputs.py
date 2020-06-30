#!/usr/bin/env python3

"""
get inputs
"""

from typing import List
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from _get_segments import _get_segments


def _get_inputs(dataframe, _maxlen, tokenizer):
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
    # return titles_padded
    titles_segment: List[List[int]] = _get_segments(titles_padded)
    titles_converted = [tokenizer.convert_tokens_to_ids(
        title) for title in titles_padded]
    # return titles_converted, titles_padded, titles_mask
    return [tf.cast(titles_converted, tf.int32),
            tf.cast(titles_segment, tf.int32), tf.cast(titles_mask, tf.int32)]
