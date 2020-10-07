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
from tensorflow.keras.layers import Activation, Dense, Embedding, GlobalAveragePooling1D
from tensorflow.keras.layers.experimental.preprocessing import TextVectorization

from shared.type import NLPType
from shared.utils import get_file_path_relative
from shared.variables import data_folder, clean_data_folder, type_path_dict, main_data_file

'''
load in our dataset
'''

def process(chunk):
    print(len(chunk))

def main():
    library_analysis_data_folder = type_path_dict[NLPType.library_analysis]

    clean_data_dir = get_file_path_relative(f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}")
    clean_data_path = get_file_path_relative(f"{clean_data_dir}/{main_data_file}")
    logger.info(f"Retrieving clean data")

    logger.info(f"Loading data from: {clean_data_path}")

    dataset_dir = "dataset"
    
    seed = 42

    # train_ds = tf.keras.preprocessing.text_dataset_from_directory(
    #     clean_data_dir, batch_size=1024, validation_split=0.2, subset="training", seed=seed
    # )
    # val_ds = tf.keras.preprocessing.text_dataset_from_directory(
    #     clean_data_dir, batch_size=1024, validation_split=0.2, subset="validation", seed=seed
    # )

    df = pd.read_csv(clean_data_path)
    print(df.dtypes)


if __name__ == "__main__":
    main()