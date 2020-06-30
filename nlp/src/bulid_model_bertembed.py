#!/usr/bin/env python3

"""
takes the bert output as is and just trains the defined top layers
"""

import tensorflow as tf


def build_model_bertembed(num_categories, max_sequence_length=64):
    """
    build model bertembed
    """
    # The exponential activation function for our output dense layer is the ideal version
    input_ = tf.keras.layers.Input(
        shape=(max_sequence_length, 768), name='bert_encoding')
    x_data = tf.keras.layers.Dense(int(2*num_categories),
                                   activation='exponential')(input_)
    # x_data = tf.keras.layers.LSTM(int(2*num_categories), return_sequences=True)(x_data)
    x_data = tf.keras.layers.Dropout(0.3)(x_data)
    x_data = tf.keras.layers.Dense(
        int(1.4*num_categories), activation='relu')(x_data)
    x_data = tf.keras.layers.GlobalAveragePooling1D()(x_data)
    output_ = tf.keras.layers.Dense(
        int(num_categories), activation='sigmoid', name='output')(x_data)
    model = tf.keras.models.Model(input_, output_)
    print(model.summary())
    return model
