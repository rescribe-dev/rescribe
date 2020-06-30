#!/usr/bin/env python3
"""
trains all of bert
"""
import tensorflow as tf


def build_model_fully_connected(bert_layer, num_categories, max_sequence_length=64):
    """add a pretrained bert model as a keras layer"""
    input_word_ids = tf.keras.layers.Input(
        (max_sequence_length,), dtype=tf.int32, name='input_word_ids')
    input_masks = tf.keras.layers.Input(
        (max_sequence_length,), dtype=tf.int32, name='input-masks')
    input_segments = tf.keras.layers.Input(
        (max_sequence_length,), dtype=tf.int32, name='input_segments')
    _, sout = bert_layer([input_word_ids, input_masks, input_segments])
    x = tf.keras.layers.Dense(
        int(1.2 * num_categories), activation='relu')(sout)
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    output_ = tf.keras.layers.Dense(
        int(num_categories), activation='sigmoid', name='output')(x)

    model = tf.keras.models.Model(
        [input_word_ids, input_masks, input_segments], output_)

    print(model.summary())

    return model
