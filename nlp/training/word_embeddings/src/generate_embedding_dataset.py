import io
import os
import ast
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf

from loguru import logger

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

    logger.info("Encoding import statements")
    imports_df["encoded"] = [
        get_encoding(x, vocab) for x in imports_df["imports"]
    ]

    logger.info("Validating dataset")
    train = tuple(imports_df["encoded"].tolist())
    for i, item in enumerate(train):
        if len(item) != 64:
            logger.error(f"Uh Oh! index: {i}, length: {len(item)}")

    """
    https://stackoverflow.com/questions/49579684/what-is-the-difference-between-dataset-from-tensors-and-dataset-from-tensor-slic
    from_tensors combines the input and returns a dataset with a single element:

    t = tf.constant([[1, 2], [3, 4]])
    ds = tf.data.Dataset.from_tensors(t)   # [[1, 2], [3, 4]]

    from_tensor_slices creates a dataset with a separate element for each row of the input tensor:

    t = tf.constant([[1, 2], [3, 4]])
    ds = tf.data.Dataset.from_tensor_slices(t)   # [1, 2], [3, 4]

    """
    logger.info(f"Generating tf dataset with batch size: {batch_size}")
    logger.debug(f"Length of train: {len(train)}")
    ds = tf.data.Dataset.from_tensor_slices(train).batch(batch_size)

    savepath = os.path.join(clean_data_dir, tf_data_folder)
    logger.info(f"Saving dataset to disk at {savepath}")
    try:
        tf.data.experimental.save(ds, savepath)
        # pickle.write(logger.critical(ds.element_spec))
    except Exception as err:
        logger.error(f"Unable to save tf dataset to path {savepath}")
        logger.error(err)
        raise err


if __name__ == "__main__":
    main()
