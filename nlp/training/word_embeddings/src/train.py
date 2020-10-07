import io
import os
import re
import shutil
import string
import pandas as pd
import numpy as np
import tensorflow as tf

from datetime import datetime
from loguru import logger
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
from shared.utils import get_file_path_relative
from shared.variables import (
    data_folder,
    clean_data_folder,
    type_path_dict,
    main_data_file,
)


########## DEBUGGING VARS ##########

DEBUG_ALL = True
DEBUG_IMPORT_DATA = True or DEBUG_ALL
####################################

"""
load in our dataset
"""


def process(chunk):
    print(len(chunk))


def main():
    library_analysis_data_folder = type_path_dict[NLPType.library_analysis]

    clean_data_dir = get_file_path_relative(
        f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}"
    )
    clean_data_path = get_file_path_relative(
        f"{clean_data_dir}/{main_data_file}"
    )

    if DEBUG_IMPORT_DATA:
        if os.path.exists(clean_data_path):
            logger.success(f"Input data file found: {clean_data_path}")
        else:
            logger.error(
                f"""Input data file not found, looked for {clean_data_path}
                Try running load, ANTLR Server, clean again?"""
            )
    assert os.path.exists(clean_data_path)
    imported_data = pd.read_csv(clean_data_path, index_col=0)
    # need index_col = 0 to avoid duplicating the index column

    if DEBUG_IMPORT_DATA:
        logger.success(f"Successfully imported {clean_data_path}")
        logger.debug("dtypes:\n" + str(imported_data.dtypes))
        logger.debug("head():\n" + str(imported_data.head()))

    seed = 42

    # Main issue: We diverge from the tutorial here because in the tutorial they have

    # Is it positive                :               Review
    #       0                       :                  I hated this movie
    #       1                       :                  Likeable
    #       1                       :                  Needs to win an oscar

    # We have: a list of words...

    # train_ds = tf.keras.preprocessing.text_dataset_from_directory(
    #     clean_data_dir, batch_size=1024, validation_split=0.2, subset="training", seed=seed
    # )
    # val_ds = tf.keras.preprocessing.text_dataset_from_directory(
    #     clean_data_dir, batch_size=1024, validation_split=0.2, subset="validation", seed=seed
    # )


if __name__ == "__main__":
    main()
