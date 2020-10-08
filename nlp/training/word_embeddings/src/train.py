import io
import os
import re
import ast
import shutil
import string
import pandas as pd
import numpy as np
import tensorflow as tf

import seaborn as sns
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
DEBUG_MAKE_VOCAB = True or DEBUG_ALL
####################################

"""
load in our dataset
"""

def get_data():
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
    imported_data['imports'] = imported_data['imports'].apply(lambda x: ast.literal_eval(x))
    # need index_col = 0 to avoid duplicating the index column

    if DEBUG_IMPORT_DATA:
        logger.success(f"Successfully imported {clean_data_path}")
        logger.debug("dtypes:\n" + str(imported_data.dtypes))
        logger.debug("head():\n" + str(imported_data.head()))
    return imported_data


def get_vocabulary(imports_df):
    vocabulary = dict()
    for row in imports_df.itertuples():
        for statement in row[1]:
            if statement not in vocabulary:
                vocabulary[statement] = 1
            else:
                vocabulary[statement] += 1
            
    
    if DEBUG_MAKE_VOCAB:
        logger.success(f"Successfully created dictionary of {len(vocabulary)} words")
        logger.debug(vocabulary['java.io.BufferedReader'])
        values = []
        for (key, value) in vocabulary.items():
            values.append(value)
        
        ax = sns.distplot(values)
        fig = ax.get_figure()
        fig.savefig('distplot.png')
        
        sorted_dict = sorted(vocabulary.items(), key=lambda x:x[1], reverse=True)
        NUM_LIBRARIES = 10
        logger.debug(f"{NUM_LIBRARIES} most popular libraries: ")
        counter = 1
        for i in sorted_dict[0:NUM_LIBRARIES]:
            logger.debug(f"\t{counter}: {i[0]}: {i[1]}")
            counter += 1
    return vocabulary

def process(chunk):
    print(len(chunk))


def main():
    imports_df = get_data()
    vocab = get_vocabulary(imports_df)

    seed = 42


if __name__ == "__main__":
    main()
