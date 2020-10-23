import sys
import io
import os
import re
import ast
import shutil
import string
import pandas as pd
import numpy as np
import tensorflow as tf
import tensorflow_addons as tfa
import pickle
import typing
import seaborn as sns
from datetime import datetime
from loguru import logger

# from tqdm import tqdm

from tensorflow import convert_to_tensor
from tensorflow.keras import Model, Sequential
from tensorflow.keras.layers import (
    Activation,
    Dense,
    Embedding,
    GlobalAveragePooling1D,
)
from tensorflow.keras.layers.experimental.preprocessing import (
    TextVectorization,
)

from shared.type import NLPType
from shared.utils import get_file_path_relative, list_files
from shared.variables import (
    data_folder,
    clean_data_folder,
    type_path_dict,
    main_data_file,
    we_max_sequence_length as max_sequence_length,
    we_batch_size as batch_size,
    we_tf_data_folder as tf_data_folder,
)

AUTOTUNE = tf.data.experimental.AUTOTUNE
embedding_dimensionality: int = 5


def get_data(clean_data_path):

    assert os.path.exists(clean_data_path)
    imported_data = pd.read_csv(clean_data_path, index_col=0)
    imported_data["imports"] = imported_data["imports"].apply(
        lambda x: ast.literal_eval(x)
    )
    # need index_col = 0 to avoid duplicating the index column

    return imported_data


def get_encoding(import_list, vocab, max_sequence_length=64):
    tensor = []
    for i, item in enumerate(import_list):
        if i >= max_sequence_length:
            break
        try:
            tensor.append(vocab[item])
        except KeyError:
            tensor.append(0)

    if len(tensor) < max_sequence_length:
        tensor += [0] * (max_sequence_length - len(tensor))

    return np.asarray(tensor)


def get_vocabulary(imports_df):
    vocabulary = dict()
    counter = 1
    for row in imports_df.itertuples():
        for statement in row[1]:
            if statement not in vocabulary:
                vocabulary[statement] = counter
                counter += 1

    return vocabulary


def get_ds_length(ds):
    length = 0
    for elem in ds:
        length += 1

    return length


def main():

    library_analysis_data_folder = type_path_dict[NLPType.library_analysis]

    clean_data_dir = get_file_path_relative(
        f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}"
    )
    clean_data_path = get_file_path_relative(
        f"{clean_data_dir}/{main_data_file}"
    )

    logger.info(f"Loading data from: {clean_data_path}")
    imports_df = get_data(clean_data_path)

    logger.info("Generating vocabulary")
    vocab = get_vocabulary(imports_df)
    vocab_length = len(vocab)

    vocab_length_path = os.path.join(clean_data_dir, "vocab_length.pkl")
    try:
        logger.info(f"Writing vocab length to file: {vocab_length_path}")
        with open(vocab_length_path, "wb") as outfile:
            pickle.dump(vocab_length, outfile)
    except Exception as err:
        logger.error(
            f"Unable to write vocab length to file: {vocab_length_path}"
        )
        logger.error(err)
        raise err

    ds = tuple(imports_df["imports"])
    print(len(ds))
    # exit(1)
    logger.debug(f"Length of dataset: {len(ds)}")
    # path_to_load = os.path.join(clean_data_dir,tf_data_folder)

    # logger.debug(f"Attempting to open {path_to_load}")
    # ds = tf.data.experimental.load(path_to_load, tf.TensorSpec(shape=(max_sequence_length), dtype=tf.int64))
    dataset_length = 0
    for _ in ds:
        dataset_length += 1

    train_size = int(0.7 * dataset_length)
    val_size = int((dataset_length - train_size) / 2)
    # test_size = int(dataset_length - val_size - train_size)

    train_ds = ds[:train_size]
    # savepath = os.path.join(clean_data_dir, tf_data_folder)
    # train_ds = tf.data.experimental.load(
    #     savepath, tf.TensorSpec(shape=(None,), dtype=tf.int64)
    # )
    # logger.success("Imported tensorflow experiment")
    val_ds = ds[train_size : train_size + val_size]
    test_ds = ds[train_size + val_size :]

    logger.info(
        f"Lengths:\n train_ds: {get_ds_length(train_ds)}\n test_ds: {get_ds_length(test_ds)}\n val_ds: {get_ds_length(val_ds)}"
    )
    vocab_length = -1
    try:
        with open(
            os.path.join(clean_data_dir, "vocab_length.pkl"), "rb"
        ) as file:
            vocab_length = int(pickle.load(file))
    except Exception as err:
        logger.critical(
            "Failed to import length of vocabulary. Exiting..."
        )
        logger.error(err)
        raise err
    logger.debug(f"Type of imports_df = {type(imports_df)}")
    logger.info(f"Vocab length: {vocab_length}")
    vectorize_layer = TextVectorization(
        max_tokens=vocab_length, output_mode="int"
    )
    logger.success("Created text vectorization layer")
    # batch_size = 70
    list_of_imports_joined: typing.List[str] = np.hstack(ds).tolist()
    dataset_all_tokens = tf.data.Dataset.from_tensor_slices(
        list_of_imports_joined
    )
    vectorize_layer.adapt(dataset_all_tokens.batch(batch_size))
    text_vectorization_model = tf.keras.models.Sequential(
        [tf.keras.Input(shape=(1,), dtype=tf.string), vectorize_layer]
    )
    logger.success("Text vectorization complete?")
    ### Josh saves the model out to disk at this point
    vectorized_tokens: typing.List[int] = np.hstack(
        text_vectorization_model.predict(
            list_of_imports_joined, batch_size=batch_size
        )
    ).tolist()
    vectorized_tokens_dataset = tf.data.Dataset.from_tensor_slices(
        vectorized_tokens
    )
    """ I have no idea what window_size should be, assuming bigger is better... """
    window_size = 30
    batched_vectorized_tokens = vectorized_tokens_dataset.batch(
        window_size + 1, drop_remainder=True
    )

    ### Josh's code but I think not relevant here because it's essentially for guessing the last word of a sentence.
    def split_train_test(batch: typing.List[int]):
        input_text = batch[:-1]
        target_text = batch[1:]
        return input_text, target_text

    training_dataset = batched_vectorized_tokens.map(split_train_test)
    logger.success("Training data sample:")

    for input_example, target_example in training_dataset.take(20):
        logger.info(f"\ninput: {input_example} --> {target_example}")
        logger.info(f"type of first is: {type(input_example[0])}")
    """ I have no idea what buffer_size should be """
    buffer_size = 50
    training_dataset = training_dataset.shuffle(buffer_size).batch(
        batch_size, drop_remainder=True
    )

    # train_ds = ds.take(train_size)
    # test_ds = ds.skip(train_size)
    # val_ds = test_ds.skip(val_size)
    # test_ds = test_ds.take(test_size)

    # train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    # val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    # embedding_layer = tf.keras.layers.Embedding(vocab_length, embedding_dimensionality)
    # result = embedding_layer(tf.constant([1,2,3]))
    # print(result.numpy())

    def custom_standardization(input_data):
        return input_data

    vectorize_layer = TextVectorization(
        standardize=custom_standardization,
        max_tokens=vocab_length,
        output_mode="int",
        output_sequence_length=max_sequence_length,
    )

    # losses = tf.nn.softmax_cross_entropy_with_logits(logits=scores, labels=self.input_y)
    model = Sequential(
        [
            Embedding(
                vocab_length, embedding_dimensionality, name="embedding"
            ),
        ]
    )

    tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir="logs")
    checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
        filepath="rnn/", save_weights_only=True
    )

    def loss(pred, targs):
        """
        return loss for given iteration
        """
        logger.critical(f"type of targs: {type(targs[0])}")
        cos_loss = tf.keras.losses.CosineSimilarity(
            axis=1  # pred, targs  # , tf.ones([50, embedding_dimensionality])
        )
        return cos_loss(pred, targs).numpy()

    def loss(targets, logits):
        """
        return loss for given iteration
        """
        return tfa.seq2seq.sequence_loss(
            logits, targets, tf.ones([batch_size, window_size])
        )

    logger.critical("Vocab Length: " + str(vocab_length))
    model.compile(
        # optimizer=tf.keras.optimizers.Adam(
        #     learning_rate=1e-3
        # ),  # "adam",  # tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=loss,  # tf.keras.losses.CosineSimilarity,  # loss, -- need this no gradients for for any variables
        metrics=["accuracy"],
    )
    logger.info(f"training dataset shape: {training_dataset}")
    # input(">>>")
    try:
        model.fit(
            training_dataset,
            # validation_data=val_ds,
            epochs=15,
            callbacks=[checkpoint_callback, tensorboard_callback],
        )
    except RuntimeError as ex:
        # input()
        print(ex)
        logger.critical("Broken during model.fit")

        sys.exit(1)
    try:
        model.summary()
    except RuntimeError as ex:
        print(ex)
        logger.critical("Broken during model.summary")
        sys.exit(1)
    logger.success("No errors?")


if __name__ == "__main__":
    main()
"""
I concede defeat --- I feel like the data should be formatted into tuples with each import getting paired with every other import in a file after the vectorization process and then those getting passed into the model with loss function cosine similarity?
"""

