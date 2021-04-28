import os
import ast
import numpy as np
import pandas as pd
from loguru import logger
import tensorflow as tf
from sklearn.model_selection import train_test_split
from utils.utils import read_from_disk
from utils.variables import holdout

def label_count(values, label):
    """
    Return the count of all of the data points with a certain label
    """
    count = 0
    for row in values:
        if np.array_equal(row, label):
            count += 1

    return count
        
def prepare_data(clean_folder, clean_data_file, classes):
    
    # Load the clean data from disk
    clean_data = read_from_disk(os.path.join(clean_folder, clean_data_file), extension='tgz')
    
    data = pd.DataFrame()
    for i, frame in enumerate(clean_data):
        try:
            frame = frame.drop(columns=["id", "tags"])
        except ValueError as err:
            logger.error(
                f"Could not drop 'id' and 'tags' columns of frame {i}, verify data integrity")
            raise err

        data = pd.concat([data, frame])
        
    dataset_len: int = len(data)
    if dataset_len == 0:
        raise RuntimeError(f'no data found for language_prediction_model')
    logger.info(f"Dataset Generated - length: {dataset_len}")
    
    
    # Prepare the data for ingestion into bert
    num_classes = len(classes)
    data = data.reset_index(drop=True)
    data["tags_cat"] = data["tags_cat"].apply(lambda x: np.asarray(ast.literal_eval(x))) # input is a string of form "[1, 0, 0]", the output is a numpy array of the same info

    
    # Take some simple stats
    values = data["tags_cat"].values
    print(values)
    for index in range(num_classes):
        label = np.zeros(num_classes)
        label[index] = 1
        count = label_count(values, label)
        logger.info(
            f"Number of data points with label {label} - {count}")
        logger.info(
            f"percentage of data points with label {label} - {count / len(values) * 100}")
    
    
    # get the train test split
    X_train, X_test, y_train, y_test = train_test_split(data.title.to_numpy(), data.tags_cat.to_numpy(), test_size=holdout)
    
    logger.info(f"x_train length {len(X_train)}")
    logger.info(f"x_test length {len(X_test)}")
    logger.info(f"y_train length {len(y_train)}")
    logger.info(f"y_test length {len(y_test)}")
    
    # because tensorflow didnt work without this
    y_train = list(y_train)
    y_train = np.asarray(y_train)
    y_test = list(y_test)
    y_test = np.asarray(y_test)
    
    return X_train, X_test, y_train, y_test