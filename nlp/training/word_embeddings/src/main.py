#!/usr/bin/env python3
"""
main file

entry point for running assignment 1
"""
import networkx as nx
import ast
import string
import pandas as pd
import numpy as np
import tensorflow as tf

from os.path import exists
from loguru import logger
from tensorflow import convert_to_tensor

from shared.type import NLPType
from shared.utils import get_file_path_relative, list_files
from shared.variables import (
    data_folder,
    clean_data_folder,
    type_path_dict,
    main_data_file,
)

AUTOTUNE = tf.data.experimental.AUTOTUNE
embedding_dimensionality: int = 5

# import code
# code.interact(local=locals())
# Use this snippet to stop running the program and test stuff in the IDE
IMPORTS_COLUMN_NAME = "imports"


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


def get_data(clean_data_path=None):
    if clean_data_path == None:
        train_name: str = "train"
        library_data_folder = type_path_dict[
            NLPType.library
        ]

        clean_data_dir = get_file_path_relative(
            f"{data_folder}/{clean_data_folder}/{library_data_folder}"
        )
        clean_data_path = get_file_path_relative(
            f"{clean_data_dir}/{main_data_file}"
        )
        logger.info(f"Loading data from: {clean_data_path}")
    assert exists(clean_data_path)
    imported_data = pd.read_csv(clean_data_path, index_col=0)
    imported_data["imports"] = imported_data["imports"].apply(
        lambda x: ast.literal_eval(x)
    )
    # need index_col = 0 to avoid duplicating the index column
    logger.success("Data loaded")
    return imported_data


# first vectorize the libraries
# take difference between one library and another
# each library

# cosine idea
# pandas numpy scikit-learn
# [11234, 4321421, 43214]

# model.predict("numpy, scikit-learn, testasdf")
# numpy scikit-learn tensorflow
# [4321421, 43214, 98343]

# cosine_sim([11234, 4321421, 43214], [4321421, 43214, 98343]) approximates 1
# therefore numpy scikit-learn tensorflow is output

# before we forget
# first step - try neural net with pairs of imports
# add vectorize layer to sequential model, make sure you have the tensorflow dataset created with correct shape
# then try changing the sequential model to be a graph, with edge weights that are equal to the number of
# times the two libraries are used together


def count_imports_and_max_len(
    imports_df, imports_column_name=IMPORTS_COLUMN_NAME
):
    logger.info("Counting number of imports")
    length_of_imports_list: List[int] = [
        len(x) for x in imports_df[imports_column_name]
    ]
    total_number_imports: int = sum(length_of_imports_list)
    logger.success(f"Counted {total_number_imports} imports.")
    return total_number_imports, max(length_of_imports_list)


def vectorize_imports(imports_df, total_number_imports, max_len):
    logger.info("Creating Vectorize layer")
    from tensorflow.python.keras.layers.preprocessing import (
        text_vectorization,
    )

    vectorize_layer = tf.keras.layers.experimental.preprocessing.TextVectorization(
        max_tokens=total_number_imports,
        output_mode="int",
        output_sequence_length=max_len,
        split=text_vectorization.SPLIT_ON_WHITESPACE,
        standardize=None,
    )

    logger.success("Created vectorize layer")
    logger.info("Preparing to adapt data to vectorize layer")
    imports_series = imports_df["imports"].to_list()
    imports_flattened = np.concatenate(imports_series)
    tf_data = tf.data.Dataset.from_tensor_slices(imports_flattened)
    vectorize_layer.adapt(tf_data.batch(64))
    model = tf.keras.modelsSequential()
    model.add(tf.keras.Input(shape=(1,), dtype=tf.string))
    model.add(vectorize_layer)
    # option 1
    # model.add(graphLayer)
    # option 2
    # model.add(LSTM())
    # model.add(Dense())
    space_stripper = lambda s: s.strip()
    super_space_stripper = lambda l: list(map(space_stripper, l))
    stripped_imports = list(map(super_space_stripper, imports_series))
    concatter = lambda l: " ".join(l)
    space_joined_imports = list(map(concatter, stripped_imports))
    vectorized_imports = model.predict(space_joined_imports)
    return vectorized_imports, vectorize_layer, model


def get_pairs_of_imports(vectorized_imports):
    from itertools import combinations

    pairs = []
    generate_and_add_to_pairs = lambda l: pairs.extend(combinations(l, 2))
    # logger.debug(len(vectorized_imports))
    # logger.debug(vectorized_imports[0])
    # exit(1)

    def make_pairs(l):
        # ToDO: Change this to binary search, because otherwise, this could get slow (31*num_files comparisons)
        index = 0
        len_l = len(l)
        while index < len_l:
            if l[index] == 0:
                break
            index += 1
        if index > 0:
            generate_and_add_to_pairs(l[0:index])

    # TODO: Should this be a mapped function instead of a for .. in range ..?
    for i in range(len(vectorized_imports)):
        make_pairs(vectorized_imports[i])
    logger.success(
        f"Finished generating pairs of all imports ({len(pairs)} pairs). Example:"
    )
    logger.debug(pairs[0])
    return pairs


def make_graph(pairs):
    logger.debug("About to create a graph")
    graph_of_imports = nx.Graph()
    # graph_of_imports.add_edges_from(pairs)
    # ToDO: Shouldn't this also be a mapped function??
    for import_a, import_b in pairs:
        if graph_of_imports.has_edge(import_a, import_b):
            graph_of_imports[import_a][import_b]["weight"] += 1
        else:
            graph_of_imports.add_edge(import_a, import_b, weight=1)
    logger.success("Made a graph!")
    return graph_of_imports


def run_interactive_test_loop(vocabulary, model, graph):
    logger.info("Stepping into infinite loop to test...")
    format_import = lambda n: f"{n}:{vocabulary[n]}"
    while True:
        try:
            import_to_try = input(
                "What import would you like to try? >>> "
            )  # Note that this can either be index of import or name of import
            max_num_imports_to_show = int(
                input(
                    "What is the maximum number of imports you would like to see? >>> "
                )
            )  # This is only a number
            print("\n" * 100)  # Clear the screen

            # If possible, convert the input into an index. If not an index, give up, it's the name of an import
            try:
                import_to_try = int(import_to_try)
            except Exception:
                import_to_try = model.predict([import_to_try])[0][0]

            # Print out the import received and the imports it is connected to
            logger.info(f"{format_import(import_to_try)} was received.")
            edges = list(graph.edges(import_to_try, data=True))
            edges = sorted(
                edges, key=lambda i: i[2]["weight"], reverse=True
            )
            edges = edges[:max_num_imports_to_show]
            for e in edges:
                logger.debug(f"{format_import(e[1])}: {e[2]['weight']}")
        except Exception as e:
            logger.debug(e)
            # pass
            # logger.debug("An Exception occurred: ")
            # logger.debug(e.args)
            # If the index provided is out of range, this block will get triggered
            # If the import string doesn't exist, then it'll just return <UNK>


def main():
    initialize()
    imports_df = get_data()
    total_number_imports, max_len = count_imports_and_max_len(imports_df)
    vectorized_imports, vectorize_layer, model = vectorize_imports(
        imports_df, total_number_imports, max_len
    )
    # An array of imports in the order they were
    vocabulary = vectorize_layer.get_vocabulary()

    # TODO: Can't this be better done with a numpy array?
    vectorized_imports = vectorized_imports.tolist()
    # imports = imports_df[IMPORTS_COLUMN_NAME].tolist()
    imports = vectorized_imports
    pairs = get_pairs_of_imports(imports)
    graph = make_graph(pairs)
    run_interactive_test_loop(vocabulary, model, graph)


if __name__ == "__main__":
    main()

"""
Two ways of splitting data: 
1) generate tuples of every possible combination
2) generate 'sentences' the way Josh was before...
idk which works better, but we will see

generating tuples: 

"""
