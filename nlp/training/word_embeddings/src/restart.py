#!/usr/bin/env python3
"""
main file

entry point for running assignment 1
"""

# from clean import clean_tokenize
# from ngrams import n_grams_train, n_grams_predict_next, SmoothingType
from variables import random_state

# random_state = 42
# import numpy as np
# import tensorflow as tf
import random


from rnn import rnn_train, rnn_predict_next

# from loguru import logger

import io
import os
import re
import ast
import shutil
import string
import pandas as pd
import numpy as np
import tensorflow as tf
import pickle

import seaborn as sns
from datetime import datetime
from loguru import logger
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


def initialize() -> None:
    """
    initialize before running anything
    """
    tf.random.set_seed(random_state)
    random.seed(random_state)
    np.random.seed(random_state)
    logger.info(
        f"Num GPUs Available: {len(tf.config.experimental.list_physical_devices('GPU'))}"
    )


def get_data(clean_data_path):

    assert os.path.exists(clean_data_path)
    imported_data = pd.read_csv(clean_data_path, index_col=0)
    imported_data["imports"] = imported_data["imports"].apply(
        lambda x: ast.literal_eval(x)
    )
    # need index_col = 0 to avoid duplicating the index column

    return imported_data


def newmain():
    initialize()

    # Clean Data

    train_name: str = "train"
    # train_data = clean_tokenize(f'{train_name}.txt')[0]
    # valid_name: str = 'valid'
    # validation_data = clean_tokenize(f'{valid_name}.txt')[0]
    # input_name: str = 'input'
    # input_data = clean_tokenize(f'{input_name}.txt')[0]
    library_analysis_data_folder = type_path_dict[NLPType.library_analysis]

    clean_data_dir = get_file_path_relative(
        f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}"
    )
    clean_data_path = get_file_path_relative(
        f"{clean_data_dir}/{main_data_file}"
    )
    logger.info(f"Loading data from: {clean_data_path}")
    imports_df = get_data(clean_data_path)
    logger.success("Data loaded")
    logger.info("Counting number of imports")
    total_number_imports = 0
    max_len = 0
    for _, row in imports_df.iterrows():
        pass
        num_imports_in_row = len(row["imports"])
        total_number_imports += num_imports_in_row
        max_len = max(num_imports_in_row, max_len)
    logger.success(f"Counted {total_number_imports} imports.")
    logger.info("Creating Vectorize layer")
    from tensorflow.python.keras.layers.preprocessing import (
        text_vectorization,
    )

    SPLIT_ON_WHITESPACE = text_vectorization.SPLIT_ON_WHITESPACE
    vectorize_layer = tf.keras.layers.experimental.preprocessing.TextVectorization(
        max_tokens=total_number_imports,
        output_mode="int",
        output_sequence_length=max_len,
        split=SPLIT_ON_WHITESPACE,
    )
    logger.success("Created vectorize layer")
    logger.info("Preparing to adapt data to vectorize layer")
    imports_series = imports_df["imports"].to_list()
    # imports_series = np.ndarray.tolist(imports_series)
    imports_flattened = np.concatenate(imports_series)
    # logger.debug(imports_flattened)
    # np_imports_flattened = np.asarray(imports_flattened).astype("str")
    tf_data = tf.data.Dataset.from_tensor_slices(imports_flattened)
    vectorize_layer.adapt(tf_data.batch(64))
    model = tf.keras.models.Sequential()
    model.add(tf.keras.Input(shape=(1,), dtype=tf.string))
    model.add(vectorize_layer)
    space_stripper = lambda s: s.strip()
    super_space_stripper = lambda l: list(map(space_stripper, l))
    stripped_imports = list(map(super_space_stripper, imports_series))
    concatter = lambda l: " ".join(l)
    space_joined_imports = list(map(concatter, stripped_imports))
    # input_data = [["test", "idk", "123"], ["test"]]
    ########## DONE WITH VECTORIZATION
    vectorized_imports = model.predict(space_joined_imports)
    vectorized_imports = vectorized_imports.tolist()
    # logger.critical(vectorized_imports)
    from itertools import combinations

    pairs = []
    generate_and_add_to_pairs = lambda l: pairs.extend(combinations(l, 2))
    # logger.debug(len(vectorized_imports))
    # logger.debug(vectorized_imports[0])
    # exit(1)

    def get_pairs(l):
        index = 0
        len_l = len(l)
        while index < len_l:
            if l[index] == 0:
                break
            index += 1
        if index > 0:
            generate_and_add_to_pairs(l[0:index])

    apply_get_pairs = lambda l: get_pairs(l)
    # apply_get_pairs(vectorized_imports)
    # func = np.vectorize(get_pairs)
    # func(vectorized_imports)
    # map(get_pairs, vectorized_imports)
    for i in range(len(vectorized_imports)):
        get_pairs(vectorized_imports[i])
    logger.success(
        f"Finished generating pairs of all imports ({len(pairs)} pairs). Example:"
    )
    logger.debug(pairs[0])
    # vectorized_2d_list = model.predict(imports_df["imports"])
    # i = 5

    # def predict(l):
    #     p = model.predict(l)
    #     # logger.info(f"{l}: {p}")

    # imports_df["imports"].apply(predict)
    logger.success("No errors")


if __name__ == "__main__":
    newmain()

"""
Two ways of splitting data: 
1) generate tuples of every possible combination
2) generate 'sentences' the way Josh was before...
idk which works better, but we will see

generating tuples: 

"""

