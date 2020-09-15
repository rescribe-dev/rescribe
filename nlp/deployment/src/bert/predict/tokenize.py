#!/usr/bin/env python3
"""
    tokenize input
"""

from transformers import AlbertTokenizer
from typing import List
import numpy as np
from shared.variables import max_sequence_length
from tqdm import tqdm


def tokenize(sentences: List[str], tokenizer: AlbertTokenizer) -> np.ndarray:
    """
    tokenize inputs
    """
    input_ids, input_masks, input_segments = [], [], []
    for sentence in tqdm(sentences):
        inputs = tokenizer.encode_plus(sentence, add_special_tokens=True, max_length=max_sequence_length, pad_to_max_length=True,
                                       return_attention_mask=True, return_token_type_ids=True, truncation=True)
        input_ids.append(inputs['input_ids'])
        input_masks.append(inputs['attention_mask'])
        input_segments.append(inputs['token_type_ids'])

    return np.asarray(input_ids, dtype='int32'), np.asarray(input_masks, dtype='int32'), np.asarray(input_segments, dtype='int32')
