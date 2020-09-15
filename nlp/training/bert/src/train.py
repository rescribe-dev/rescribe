#!/usr/bin/env python3
"""
    Training and model construction for the language classifier
"""

import tensorflow as tf
from tqdm import tqdm
from os import remove
from os.path import join
from loguru import logger
import pandas as pd
import numpy as np
import ast
import yaml
from sklearn.model_selection import train_test_split
from shared.utils import list_files, get_file_path_relative
from shared.type import NLPType
from shared.variables import clean_data_folder, batch_size, do_lower_case, max_sequence_length, holdout, albert, \
    data_folder, language_data_folder, library_data_folder, models_folder, checkpoint_file, classes_file
from sys import argv
from glob import glob
from transformers import AlbertTokenizer
from predict.tokenize import tokenize
from load_model.main import create_model


def label_count(values, label):
    """
    Return the count of all of the data points with a certain label
    """
    count = 0
    for row in values:
        if np.array_equal(row, label):
            count += 1

    return count


def str_to_array(x: str) -> np.ndarray:
    """
    The input is a string of form \"[1, 0, 0]\"
    the output should be an np ndarray object containing the same information
    """

    return np.asarray(ast.literal_eval(x), dtype=np.int32)


def delete_all_checkpoints(checkpoint_folder_path: str) -> None:
    """
    delete all checkpoint data
    """
    for file_path in glob(join(checkpoint_folder_path, '*')):
        remove(file_path)


# pylint: disable=too-many-statements

def main(train_type: NLPType, delete_checkpoints: bool = False):
    """
    Main function for training the language classifier
    """
    logger.info(
        f"Num GPUs Available: {len(tf.config.experimental.list_physical_devices('GPU'))}")

    folder_name: str = language_data_folder if train_type == NLPType.language else library_data_folder

    clean_data_folder_rel = get_file_path_relative(
        f'{data_folder}/{clean_data_folder}/{folder_name}')
    _clean_data_paths = list_files(clean_data_folder_rel, "csv")
    _indexes = [int(path.split(".")[0]) for path in _clean_data_paths]
    clean_data_file_paths = [join(clean_data_folder_rel, path)
                             for path in _clean_data_paths]

    data = pd.DataFrame()

    logger.info(f"Loading data from {len(clean_data_file_paths)} batches...")
    for path in tqdm(clean_data_file_paths):

        try:
            frame = pd.read_csv(path)
        except Exception as err:
            raise RuntimeError(f"Error reading csv at - {path}") from err

        try:
            frame = frame.drop(columns=["id", "tags"])
        except ValueError as err:
            logger.error(
                f"Could not drop 'id' and 'tags' columns of {path}, verify data integrity")
            raise err

        data = pd.concat([data, frame])

    dataset_len: int = len(data)
    if dataset_len == 0:
        raise RuntimeError(f'no data found for {train_type}')
    logger.info(f"Dataset Generated - length: {dataset_len}")

    # read classes
    classes_file_path = get_file_path_relative(
        f'{data_folder}/{clean_data_folder}/{folder_name}/{classes_file}')
    classes = []
    with open(classes_file_path, 'r') as stream:
        classes = yaml.safe_load(stream)
    num_classes = len(classes)

    data = data.reset_index(drop=True)
    data["tags_cat"] = data["tags_cat"].apply(str_to_array)
    values = data["tags_cat"].values

    for index in range(num_classes):
        label = np.asarray([0]*(num_classes))
        label[index] = 1
        logger.info(
            f"Number of data points with label {label} - {label_count(values, label)}")
        logger.info(
            f"percentage of data points with label {label} - {label_count(values, label) / len(values)}")

    logger.info("Generating Test / Train Datasets...")
    X_train, X_test, y_train, y_test = train_test_split(
        data.title.to_numpy(), data.tags_cat.to_numpy(), test_size=holdout)
    logger.info("Retrieving ALBERT Tokenizer...")
    tokenizer = AlbertTokenizer.from_pretrained(
        albert, do_lower_case=do_lower_case, add_special_tokens=True, max_length=max_sequence_length, pad_to_max_length=True)

    logger.info("Tokenizing Test / Train Datasets...")
    [train_input_ids, train_attention_mask,
        train_token_type_ids] = tokenize(X_train, tokenizer)
    [test_input_ids, test_attention_mask,
        test_token_type_ids] = tokenize(X_test, tokenizer)
    logger.info("Creating Model...")
    model = create_model(num_classes)
    model.training = True
    model.summary()

    model.compile(optimizer='Adam', loss=tf.keras.losses.BinaryCrossentropy(), metrics=[tf.keras.metrics.BinaryCrossentropy(),
                                                                                        tf.keras.metrics.Accuracy(), tf.keras.metrics.AUC(), tf.keras.metrics.Recall(), tf.keras.metrics.Precision()])

    checkpoint_folder_path = get_file_path_relative(
        f'{data_folder}/{models_folder}/{folder_name}')

    if delete_checkpoints:
        delete_all_checkpoints(checkpoint_folder_path)

    # write classes
    new_classes_file_path = get_file_path_relative(
        f"{data_folder}/{models_folder}/{folder_name}/{classes_file}")
    with open(new_classes_file_path, 'w') as yaml_file:
        yaml.dump(classes, yaml_file)

    checkpoint_path = join(checkpoint_folder_path, checkpoint_file)
    cp_callback = tf.keras.callbacks.ModelCheckpoint(filepath=checkpoint_path,
                                                     save_weights_only=True,
                                                     verbose=1)

    logger.info("\n\nInitiating Training\n")
    y_train = list(y_train)
    y_train = np.asarray(y_train)
    y_test = list(y_test)
    y_test = np.asarray(y_test)

    model.fit([train_input_ids, train_attention_mask, train_token_type_ids], y_train,
              batch_size=batch_size, epochs=1, verbose=1, validation_split=0.15, callbacks=[cp_callback])

    logger.success(
        f"Training Success! - Checkpoints saved at {checkpoint_path}")
    model.training = False
    logger.info(
        f"Evaluation: {model.evaluate(x=[test_input_ids, test_attention_mask, test_token_type_ids], y=y_test, batch_size=batch_size)}")


if __name__ == '__main__':
    if len(argv) < 2:
        raise ValueError('no type provided')
    main(NLPType(argv[1]))
