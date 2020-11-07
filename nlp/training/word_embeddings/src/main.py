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


def main() -> None:
    """
    main entry point
    """
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

    imports_formatted_for_train = []
    for list_of_imports in imports_df["imports"]:
        for i in range(len(list_of_imports) - 1):
            for j in range(i + 1, len(list_of_imports)):
                imports_formatted_for_train.append(
                    [list_of_imports[i], list_of_imports[j]]
                )
    imports_df = {}
    imports_df["imports"] = imports_formatted_for_train
    imports_df = pd.DataFrame(imports_df)
    # logger.critical(type(imports_df))
    # logger.critical(imports_df["imports"][0])
    # logger.critical(type(imports_df["imports"][0]))
    # exit(1)
    # exit(1)
    # diff between Josh's code and this:
    # 1) imports_df is one set, no validation right now...
    # 2) instead of having [sentences], we have [imports] as the column name...

    # Code from stack overflow: split the single dataframe into train and test...
    imports_df = imports_df.sample(
        frac=0.001, random_state=random_state
    )  # random state is a seed value
    # train_data = train_data.drop(train_data.index)
    train_data = imports_df.sample(
        frac=0.8, random_state=random_state
    )  # random state is a seed value
    validation_data = imports_df.drop(train_data.index)
    # end stack overflow code
    num_predict_input = 30

    # N-Grams

    # train
    # n_grams_train(train_name, clean_data=train_data)
    # # test
    # n_grams_predict_next(
    #     valid_name,
    #     clean_input_data=validation_data,
    #     file_name=f"{train_name}.json",
    #     smoothing=SmoothingType.basic,
    # )
    # n_grams_predict_next(
    #     valid_name,
    #     clean_input_data=validation_data,
    #     file_name=f"{train_name}.json",
    #     smoothing=SmoothingType.good_turing,
    # )
    # n_grams_predict_next(
    #     valid_name,
    #     clean_input_data=validation_data,
    #     file_name=f"{train_name}.json",
    #     smoothing=SmoothingType.kneser_ney,
    # )
    # # check kneser-ney with input because it has unseen data
    # n_grams_train(
    #     input_name, clean_data=train_data, n_grams=2, fill_in_blank=True
    # )
    # n_grams_predict_next(
    #     input_name,
    #     clean_input_data=input_data,
    #     file_name=f"{train_name}.json",
    #     smoothing=SmoothingType.kneser_ney,
    #     num_lines_predict=num_predict_input,
    # )

    # RNN:
    # train
    rnn_text_vectorization_model = rnn_train(
        train_name, clean_data=train_data
    )
    logger.critical(rnn_text_vectorization_model)
    input(">>> ")
    # test
    # rnn_predict_next(train_name, clean_input_data=validation_data)
    rnn_predict_next(
        train_name,
        clean_input_data=validation_data,
        num_lines_predict=num_predict_input,
        text_vectorization_model=rnn_text_vectorization_model,
    )


if __name__ == "__main__":
    main()

"""
Two ways of splitting data: 
1) generate tuples of every possible combination
2) generate 'sentences' the way Josh was before...
idk which works better, but we will see

generating tuples: 

"""

