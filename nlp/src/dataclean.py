#!/usr/bin/env python3
"""
clean data
"""

import pickle
from os.path import abspath, dirname, join
from os import mkdir
from typing import List, Set
from pandas import DataFrame, read_csv
from get_classification_labels import get_classification_labels
from get_classifications import get_classifications
from dataload import questions_output

BATCH_SIZE: int = 1000


def dataclean(clean_data_folder: str, model_input_path: str):
    """
    data clean
    """
    df_chunk = read_csv(
        abspath(join(dirname(__file__), questions_output)), chunksize=BATCH_SIZE)

    classification_labels_lol: List[List[str]] = []
    classifications: List[List[object]] = []

    for chunk in df_chunk:
        chunk = chunk.rename(
            columns={"id": "__id__", "title": "__title__", "tags": "__tags__"})
        # get all labels and save them
        classification_labels_lol.append(
            list(get_classification_labels(chunk)))

    # list comprehension to flatten out the list of lists of labels
    classification_labels_list: List[str] = [
        item for elem in classification_labels_lol for item in elem]
    classification_labels: Set[str] = set(classification_labels_list)

    try:
        mkdir(f"{model_input_path}")
    except FileExistsError:
        pass
    with open(f"{model_input_path}/classification_labels.pkl", 'wb') as pickle_file:
        pickle.dump(classification_labels, pickle_file)

    del df_chunk

    df_chunk = read_csv(
        abspath(join(dirname(__file__), questions_output)), chunksize=BATCH_SIZE)

    cls = list(classification_labels)
    nrows: int = BATCH_SIZE
    ncols: int = len(cls)
    output: List[List[object]] = []
    for _ in range(nrows):
        output.append([0] * ncols)

    for i, chunk in enumerate(df_chunk):
        chunk = chunk.rename(
            columns={"id": "__id__", "title": "__title__", "tags": "__tags__"})
        title = chunk["__title__"]
        # get the classifications of the titles in the form of a list of lists
        classifications = get_classifications(chunk, cls, output_init=output)
        df_clean = DataFrame(classifications, columns=classification_labels)
        df_clean["__title__"] = title.values.tolist()
        df_clean.to_csv(
            abspath(join(dirname(__file__), f"{clean_data_folder}/{i}.csv")))
    del df_chunk


def main():
    """
    main clean data script
    """
    clean_data_folder: str = '../clean_data'
    model_input_path = '.model_inputs'
    dataclean(clean_data_folder, model_input_path)


if __name__ == '__main__':
    main()
