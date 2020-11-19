#!/usr/bin/env python3
"""
rnn (rnn.py)
"""

from __future__ import annotations

from sys import argv
from typing import List, Optional, Any, Dict
from utils import file_path_relative
from variables import (
    sentences_key,
    clean_data_folder,
    models_folder,
    rnn_folder,
    text_vectorization_folder,
    rnn_file_name,
    output_folder,
)
from loguru import logger
from ast import literal_eval
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
import tensorflow_addons as tfa

from tensorflow.keras.layers.experimental.preprocessing import (
    TextVectorization,
)

# maximum number of words in vocabulary
vocab_size = 10000

# read dataset in batches of
batch_size = 50

# number of epochs to run
epochs = 10

# window size in rnn
window_size: int = 1


class PlotTrain(tf.keras.callbacks.Callback):
    """
    plot for training results
    """

    def __init__(self, name: str):
        super().__init__()
        self.losses = []
        self.accuracy = []
        self.logs = []
        self.name = name

    def on_train_begin(self, logs=None):
        """
        initialize
        """
        self.losses: List[float] = []
        self.accuracy: List[float] = []
        self.logs: List[Dict[str, Any]] = []

    def on_epoch_end(self, epoch, logs=None):
        """
        runs on end of each epoch
        """
        if logs is None:
            return
        self.logs.append(logs)
        self.losses.append(logs.get("loss"))
        self.accuracy.append(logs.get("accuracy"))

        if len(self.losses) > 1:
            nums = np.arange(0, len(self.losses))
            plt.style.use("seaborn")

            plt.figure()
            plt.plot(nums, self.losses, label="train loss")
            plt.plot(nums, self.accuracy, label="train accuracy")
            plt.title(f"Training Loss and Accuracy for Epoch {epoch}")
            plt.xlabel("Epoch #")
            plt.ylabel("Loss & Accuracy")
            plt.legend()
            file_path = file_path_relative(
                f"{output_folder}/rnn_{self.name}_train_epoch_{epoch}.png"
            )
            plt.savefig(file_path)


def create_text_vectorization_model(
    text_vectorization_filepath: str, dataset_all_tokens: tf.data.Dataset
) -> tf.keras.models.Sequential:
    """
    create text vectorization model
    """
    vectorize_layer = TextVectorization(
        max_tokens=vocab_size, output_mode="int"
    )
    logger.success("created text vectorization layer")
    # batch the dataset to make it easier to store
    # in memory
    vectorize_layer.adapt(dataset_all_tokens.batch(batch_size))
    logger.success("adapted vectorization to training dataset")

    text_vectorization_model = tf.keras.models.Sequential(
        [tf.keras.Input(shape=(1,), dtype=tf.string), vectorize_layer]
    )
    # logger.info(text_vectorization_model.predict(["test it help"]))
    text_vectorization_model.save(text_vectorization_filepath)
    return text_vectorization_model


def build_model(
    current_batch_size=batch_size,
) -> tf.keras.models.Sequential:
    """
    build main rnn model
    """
    # rnn params
    embedding_dim = 256
    rnn_units = 1024

    model = tf.keras.models.Sequential(
        [
            tf.keras.layers.Embedding(
                vocab_size,
                embedding_dim,
                batch_input_shape=[current_batch_size, None],
            ),
            # tf.keras.layers.GRU(
            #     rnn_units,
            #     return_sequences=True,
            #     stateful=True,
            #     recurrent_initializer="glorot_uniform",
            # ),
            tf.keras.layers.Dense(vocab_size + 1),
        ]
    )
    logger.success("created tf model")
    return model


def flatten_input(data: List[List[Any]]) -> List[Any]:
    """
    flatten the given input
    """
    return np.hstack(data).tolist()


def pad_zeros(data: List[int], num_elem: int) -> List[int]:
    """
    pads array so output is num_elem is length
    """
    if len(data) >= num_elem:
        return data[:-num_elem]
    data.extend([0] * (num_elem - len(data)))
    return data


def rnn_train(
    name: str,
    file_name: Optional[str] = None,
    clean_data: Optional[pd.DataFrame] = None,
) -> tf.keras.models.Sequential:
    """
    rnn training
    creates the tensorflow rnn model for word prediction
    """
    logger.info(f"run rnn training for {name}")

    if file_name is None and clean_data is None:
        raise ValueError("no file name or tokens provided")

    if clean_data is None:
        file_path = file_path_relative(f"{clean_data_folder}/{file_name}")
        logger.info(f"reading data from {file_path}")
        clean_data = pd.read_csv(
            file_path, converters={sentences_key: literal_eval}
        )

    tokens: List[List[str]] = clean_data[sentences_key]
    flattened_tokens: List[str] = flatten_input(tokens)
    dataset_all_tokens = tf.data.Dataset.from_tensor_slices(
        flattened_tokens
    )
    logger.critical(dataset_all_tokens)
    # imports_formatted_for_train = []
    # for row in vectorized_tokens:
    #     list_of_imports = row["imports"]
    #     for i in range(len(list_of_imports) - 1):
    #         for j in range(i + 1, len(list_of_imports)):
    #             imports_formatted_for_train.append(
    #                 [list_of_imports[i], list_of_imports[j]]
    #             )
    # vectorized_tokens_dataset = {}
    # vectorized_tokens_dataset["imports"] = imports_formatted_for_train
    # vectorized_tokens_dataset = pd.DataFrame(vectorized_tokens_dataset)
    logger.success("created all tokens text dataset")

    text_vectorization_filepath = file_path_relative(
        f"{models_folder}/{name}/{text_vectorization_folder}"
    )

    text_vectorization_model = create_text_vectorization_model(
        text_vectorization_filepath, dataset_all_tokens
    )
    logger.critical(text_vectorization_model)
    vectorized_tokens: List[int] = flatten_input(
        text_vectorization_model.predict(
            flattened_tokens, batch_size=batch_size
        )
    )
    logger.critical(vectorized_tokens)

    vectorized_tokens_dataset = tf.data.Dataset.from_tensor_slices(
        vectorized_tokens
    )
    logger.critical(vectorized_tokens_dataset)
    batched_vectorized_tokens = vectorized_tokens_dataset.batch(
        window_size + 1, drop_remainder=True
    )

    def split_train_test(batch: List[int]):
        # logger.info(batch)
        input_text = batch[:-1]
        target_text = batch[1:]
        # logger.info(input_text)
        # logger.info(target_text)
        # exit(2)
        return input_text, target_text

    training_dataset = batched_vectorized_tokens.map(split_train_test)
    logger.success("training data sample:")
    list_x = []
    for input_example, target_example in training_dataset.take(10):
        if input_example in list_x or target_example in list_x:
            logger.success("Duplicate found")
        list_x.append(input_example)
        list_x.append(target_example)

        logger.info(f"\ninput: {input_example}\ntarget: {target_example}")
    # exit(1)

    # buffer size is used to shuffle the dataset
    buffer_size = 10000
    training_dataset = training_dataset.shuffle(buffer_size).batch(
        batch_size, drop_remainder=True
    )
    logger.info(f"training dataset shape: {training_dataset}")
    model = build_model()

    def loss(targets, logits):
        """
        return loss for given iteration
        """
        # cosine loss?
        return tfa.seq2seq.sequence_loss(
            logits, targets, tf.ones([batch_size, window_size])
        )

    optimizer = tf.keras.optimizers.Adam(learning_rate=1e-3)
    model.compile(optimizer=optimizer, loss=loss, metrics=["accuracy"])
    logger.success("model compiled")

    rnn_filepath = file_path_relative(
        f"{rnn_folder}/{name}/{rnn_file_name}"
    )

    checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
        filepath=rnn_filepath, save_weights_only=True
    )

    plot_callback = PlotTrain(name)
    logger.info(f"training dataset shape: {training_dataset}")
    input(">>>")
    history = model.fit(
        training_dataset,
        epochs=epochs,
        callbacks=[checkpoint_callback, plot_callback],
    )
    model.summary()
    last_loss = plot_callback.losses[-1]
    logger.info(f"model loss: {last_loss}")
    return text_vectorization_model


def rnn_predict_next(
    name: str,
    text_vectorization_model=None,  # tf.keras.models.Sequential
    clean_input_file: Optional[str] = None,
    clean_input_data: Optional[pd.DataFrame] = None,
    num_lines_predict: Optional[int] = None,
    num_predict: int = 1,
) -> None:
    """
    predict next word(s) with given input
    """

    logger.success(f"running predictions for {name}")

    if clean_input_file is None and clean_input_data is None:
        raise ValueError("no input file name or data provided")

    model = build_model(1)
    rnn_filepath = file_path_relative(
        f"{rnn_folder}/{name}/{rnn_file_name}"
    )
    model.load_weights(rnn_filepath)
    model.build(tf.TensorShape([1, None]))
    model.summary()
    logger.critical(text_vectorization_model)
    if text_vectorization_model is None:
        text_vectorization_filepath = file_path_relative(
            f"{models_folder}/{name}/vectorization"
        )
        text_vectorization_model = tf.keras.models.load_model(
            text_vectorization_filepath
        )

    if clean_input_data is None:
        file_path = file_path_relative(
            f"{clean_data_folder}/{clean_input_file}"
        )
        logger.info(f"reading data from {file_path}")
        clean_input_data = pd.read_csv(
            file_path, converters={sentences_key: literal_eval}
        )

    predict_sentences: List[List[str]] = clean_input_data[sentences_key]
    if num_lines_predict is not None:
        predict_sentences = predict_sentences[:num_lines_predict]

    vectorize_layer: TextVectorization = text_vectorization_model.layers[0]
    vocabulary = vectorize_layer.get_vocabulary()
    # logger.info(f'vocabulary: {vocabulary}')

    # reset model, get ready for predict
    model.reset_states()

    logger.success("[[<words>]] = predicted words:")

    sum_probability_log: float = 0.0
    count_all_predict: int = 0
    for i, sentence in enumerate(predict_sentences):
        full_sentence = sentence.copy()
        for _ in range(num_predict):
            vectorized_sentence = flatten_input(
                text_vectorization_model.predict(
                    full_sentence[-window_size:], batch_size=batch_size
                )
            )
            input_eval = tf.expand_dims(vectorized_sentence, 0)
            predictions = model.predict(input_eval)
            # remove batch dimension, get probabilities of last word
            probabilities = tf.squeeze(predictions, 0)[-1]

            # get the index of the prediction based on the max probability
            predicted_index = np.argmax(probabilities)

            predicted_word = vocabulary[predicted_index]
            full_sentence.append(predicted_word)

            sum_probability_log += np.log(probabilities[predicted_index])
            count_all_predict += 1

        logger.info(
            f"{i + 1}. {' '.join(sentence)} [[{' '.join(full_sentence[len(sentence):])}]]"
        )

    if count_all_predict == 0:
        logger.info("no predictions, no perplexity")
    else:
        total_loss = -1 * sum_probability_log
        perplexity: float = np.exp(total_loss / count_all_predict)
        logger.info(f"perplexity: {perplexity}")


if __name__ == "__main__":
    if len(argv) < 2:
        raise ValueError("no n-grams training data provided")

