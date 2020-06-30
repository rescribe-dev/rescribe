#!/usr/bin/env python3
"""
gets sentence segments
"""
from typing import List


def _get_segments(sentences: List[List[str]]) -> List[List[int]]:
    """
    gets sentence segments
    """
    sentences_segments: List[List[int]] = []
    for sent in list(sentences):
        temp = []
        i = 0
        for token in sent:
            temp.append(i)
            if token == "[SEP]":
                i += 1
        sentences_segments.append(temp)
    return sentences_segments
