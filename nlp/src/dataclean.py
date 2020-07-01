#!/usr/bin/env python3
"""
clean data
"""

import pickle
from os.path import abspath, dirname, join
from os import mkdir
from typing import List, Set, Union
from pandas import DataFrame, read_csv, Series
from dataload import questions_output

BATCH_SIZE: int = 1000


def get_classifications(dataframe: DataFrame, classifications: List[str],
                        output_init: List[List[object]] = None,
                        delim: str = '|', column: str = "__tags__") -> List[List[object]]:
    """
    get classifications
    """
    if output_init:
        output: List[List[object]] = output_init
    for index, tags in enumerate(dataframe[column]):
        tag_list: List[str] = tags.split(delim)
        for tag in tag_list:
            output[index][classifications.index(tag)] = 1

    return output


def get_classification_labels(dataframe: DataFrame,
                              delim: str = '|', column: str = "__tags__") -> Set[str]:
    """
    get classification labels
    """
    classification_list: List[str] = []
    classifications: Series = dataframe[column]
    for cls in classifications:
        for tag in cls.split(delim):
            classification_list.append(tag)

    return set(classification_list)


def dataclean(clean_data_folder: str, model_input_path: str) -> None:
    """
    data clean
    """
    df_chunk: Union[DataFrame] = read_csv(
        abspath(join(dirname(__file__), questions_output)), chunksize=BATCH_SIZE)

    classification_labels_lol: List[List[str]] = []
    classifications: List[List[object]] = []

    for chunk in df_chunk:
        chunk: DataFrame = chunk.rename(
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

    df_chunk: Union[DataFrame] = read_csv(
        abspath(join(dirname(__file__), questions_output)), chunksize=BATCH_SIZE)
    classification_labels: List[str] = list(classification_labels)
    nrows: int = BATCH_SIZE
    ncols: int = len(classification_labels)
    output: List[List[int]] = []
    for _ in range(nrows):
        output.append([0] * ncols)

    for i, chunk in enumerate(df_chunk):
        chunk = chunk.rename(
            columns={"id": "__id__", "title": "__title__", "tags": "__tags__"})
        title: Union[DataFrame] = chunk[["__title__", "__tags__"]]
        # get the classifications of the titles in the form of a list of lists
        classifications: List[List[object]] = get_classifications(
            chunk, classification_labels, output_init=output)
        df_clean: DataFrame = DataFrame(
            classifications, columns=classification_labels)
        df_clean["__title__"] = title.__title__.values.tolist()
        df_clean["__tags__"] = title.__tags__.values.tolist()
        df_clean.to_csv(
            abspath(join(dirname(__file__), f"{clean_data_folder}/{i}.csv")), index=False)
    del df_chunk


def main():
    """
    main clean data script
    """
    clean_data_folder: str = '../clean_data'
    model_input_path: str = '.model_inputs'
    dataclean(clean_data_folder, model_input_path)


if __name__ == '__main__':
    main()
