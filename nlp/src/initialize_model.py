#!/usr/bin/env python3
"""
Load in the bert model from disk
"""
import tensorflow as tf
from typing import Union
from tensorflow.keras.models import Model
from variables import model_dir

nlp_model: Union[Model, None] = None


def main():
    """
    Load the mode recentbert model in from disk
    """
    global nlp_model
    try:
        nlp_model = tf.keras.models.load_model(f"{model_dir}/")
    except FileNotFoundError:
        print("No model exists in the expected directory")
