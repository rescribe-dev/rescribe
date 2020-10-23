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
import time
import seaborn as sns
from datetime import datetime
from loguru import logger

from tqdm import tqdm

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

### Variables to be added to the variables folder in future...
VECTORIZED_IMPORTS_FILE = "vectorized_impors.pickle"


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


def get_ds_length(ds):
    length = 0
    for elem in ds:
        length += 1

    return length


def generate_vectorized_imports(imports_df, output_path: str):
    import_set = set()
    now = time.time()
    for index, row in imports_df.iterrows():
        for elem in row["imports"]:
            if elem not in import_set:
                import_set.add(elem)
    logger.debug(
        f"Took {round(time.time()-now, 5)} seconds to parse in {len(import_set)} imports"
    )
    import_list = list(import_set)
    with open(output_path, "wb") as f:
        pickle.dump(import_list, f)
    return import_list


def main():

    library_analysis_data_folder = type_path_dict[NLPType.library_analysis]

    clean_data_dir = get_file_path_relative(
        f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}"
    )
    clean_data_path = get_file_path_relative(
        f"{clean_data_dir}/{main_data_file}"
    )
    VECTORIZED_IMPORTS_FILE_PATH = get_file_path_relative(
        f"{clean_data_dir}/{VECTORIZED_IMPORTS_FILE}"
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

    ds = tuple(imports_df["imports"])
    logger.debug(f"Length of dataset: {len(ds)}")
    # path_to_load = os.path.join(clean_data_dir,tf_data_folder)

    # logger.debug(f"Attempting to open {path_to_load}")
    # ds = tf.data.experimental.load(path_to_load, tf.TensorSpec(shape=(max_sequence_length), dtype=tf.int64))
    dataset_length = 0
    for elem in ds:
        dataset_length += 1

    vectorized_imports = None
    # if not os.path.exists(VECTORIZED_IMPORTS_FILE_PATH):
    vectorized_imports = generate_vectorized_imports(
        imports_df, VECTORIZED_IMPORTS_FILE_PATH
    )
    # with open(VECTORIZED_IMPORTS_FILE_PATH) as f:
    #     vectorized_imports = pickle.load(f)
    assert vectorized_imports
    imports_dict = {}
    count = 0
    for elem in vectorized_imports:
        imports_dict[elem] = count
        count += 1
    num_edges = 0
    num_vertices = len(vectorized_imports)
    for index, row in imports_df.iterrows():
        num_imports = len(row["imports"])
        edges_in_file = int(
            (num_imports * (num_imports - 1)) / 2
        )  # Should always be an int, but just in case python makes floats
        # for whatever reason. Reason being n*n-1 means one of those is
        # even, so dividing by two should be okay
        num_edges += edges_in_file
    vertex_id = [-1] * num_vertices
    assert len(vertex_id) == num_vertices
    adjacency_list = []
    for i in range(num_vertices):
        adjacency_list.append([])
    logger.critical(len(adjacency_list))
    assert len(adjacency_list) == num_vertices
    for index, row in tqdm(imports_df.iterrows()):
        l = row["imports"]
        for i in range(len(l) - 1):
            for j in range(i, len(l)):
                first = imports_dict[l[i]]
                second = imports_dict[l[j]]
                if second not in adjacency_list[first]:
                    adjacency_list[first].append(second)
                if first not in adjacency_list[second]:
                    adjacency_list[second].append(first)
    v = [0]
    adj = []
    for i in adjacency_list:
        for j in i:
            adj.append(j)
        v.append(len(adj))
    weights = [0] * len(adj)
    for index, row in tqdm(imports_df.iterrows()):
        l = row["imports"]
        for i in range(len(l) - 1):
            for j in range(i, len(l)):
                first = imports_dict[l[i]]
                second = imports_dict[l[j]]
                loc_first = v[first]
                loc_firstp1 = v[first + 1]
                while loc_first < loc_firstp1 and adj[loc_first] != second:
                    loc_first += 1
                # assert adj[loc_first] == second
                loc_second = v[second]
                loc_secondp1 = v[second + 1]
                while (
                    loc_second < loc_secondp1 and adj[loc_second] != first
                ):
                    loc_second += 1
                # assert adj[loc_second] == first
                weights[loc_first] += 1
                weights[loc_second] += 1
    while True:
        try:
            i = int(input("What index? "))
            if i == -1:
                i = imports_dict[input()]
            print(f"Selected {vectorized_imports[i]}")
            s = v[i]
            f = v[i + 1]
            st = {}
            while s < f:
                st[vectorized_imports[adj[s]]] = weights[s]
                s += 1
            st = {
                k: v
                for k, v in sorted(st.items(), key=lambda item: item[1])
            }
            st = list(st.items())[-5:]
            for e in st:
                print(f"{e[0]}\t-\t{e[1]}")
        except Exception as e:
            if e.__class__ == KeyboardInterrupt:
                exit()


if __name__ == "__main__":
    main()
