"""
Contains the GraphModel object which is capable of storing a graph of values
"""
#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents if str(elem).endswith("training"))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################


import os
import ast
import yaml
import numpy as np
import pandas as pd
import networkx as nx
import tensorflow as tf

from loguru import logger
from os.path import join, exists  # basename, dirname, exists
from itertools import combinations
from utils.types import reScribeModel
from typing import List, Optional, Tuple, Union
from utils.utils import get_file_path_relative, read_from_disk
from tensorflow.python.keras.layers.preprocessing import text_vectorization
from utils.variables import (
    base_library_prediction_data_folder,
    clean_data_file_name,
    clean_data_folder,
    data_folder,
    models_folder,
    inter_library_graph_file,
    inter_library_tokenization_model_path,
    inter_library_vocabulary_file,
    related_library_imports_column_name,
    related_library_prediction_data_folder,
)


class RLP_Model(reScribeModel):
    """
    Container class for our graph based model
    """

    def __init__(self):
        """
        Two pieces
        tensorflow model: Handles vectorization of libraries and converts the numbers to strings and vice versa
        nxgraph model: Handles all of the graph distance logic for retrieving vectors and connected vectors
        """
        super(RLP_Model, self).__init__()
        self.graph_representation = None
        self.vocabulary_list = None
        self.tokenization_model = None
        # intialize model structure in init
        # make a method to load pretrained information from disk
        # Nothing to do with loading data in here
        # method to train the model given perfect data and a set of paramaters

        # server
        # r = RLP_Model()
        # r.load_pretrained(directory)
        # r("java.lang.ArrayList", 10)

        # training
        # x_train, y_train, x_test, y_test = prepare_data(directory, args)
        # r = RLP_Model(params)

    def load_pretrained(self, directory: str):
        """
            Note, this assumes you're training locally... no touching S3 right now
        """
        # TODO: Add support for S3 loading using the PRODUCTION variable.
        graph_location = join(directory, inter_library_graph_file)
        tok_location = join(directory, inter_library_tokenization_model_path)
        vocab_location = join(directory, inter_library_vocabulary_file)
        self.graph_representation = nx.read_gpickle(graph_location)
        self.tokenization_model = tf.keras.models.load_model(tok_location)
        self.tokenization_model.compile()
        with open(vocab_location, "r") as f:
            self.vocabulary_list = yaml.full_load(f)
        if not (self.graph_representation and self.tokenization_model and self.vocabulary_list):
            raise EnvironmentError(
                "Something went wrong loading in the saved state for related library prediction"
            )
            
    def save_pretrained(self, directory: str):
        """
            This is entirely a local load
        """
        # TODO: Add S3
        graph_location = join(directory, inter_library_graph_file)
        tok_location = join(directory, inter_library_tokenization_model_path)
        vocab_location = join(directory, inter_library_vocabulary_file)
        nx.write_gpickle(self.graph_representation, graph_location)
        tf.keras.models.save_model(self.tokenization_model, tok_location)
        with open(vocab_location, 'w') as outfile:
            outfile.write(yaml.dump(list(self.vocabulary_list)))
        for x in [graph_location, tok_location, vocab_location]:
            if not exists(x):
                raise RuntimeError("Something seems to have failed to save...")
        

    @staticmethod
    def _vectorize_imports(
        imports_series: pd.DataFrame, additional_libraries: Optional[np.ndarray] = None,
    ):
        def _count_imports_and_max_len(series) -> Tuple[int, int]:
            logger.info("Counting number of imports")
            length_of_imports_list: List[int] = [len(x) for x in series]
            total_number_imports: int = sum(length_of_imports_list)
            max_len: int = max(length_of_imports_list)
            return total_number_imports, max_len

        total_number_imports, max_len = _count_imports_and_max_len(imports_series)
        logger.info("Creating Vectorize layer")

        vectorize_layer = tf.keras.layers.experimental.preprocessing.TextVectorization(
            max_tokens=total_number_imports,
            output_mode="int",
            output_sequence_length=max_len,
            split=text_vectorization.SPLIT_ON_WHITESPACE,
            standardize=None,
        )
        logger.success("Created vectorize layer")
        logger.info("Preparing to adapt data to vectorize layer")
        # to_remove = []
        # for i, row in df.iterrows():
        #     if len(row['imports']) == 0:
        #         to_remove.append(i)
        # df.drop(index=to_remove, inplace=True)
        imports_list = imports_series.to_list()
        imports_flattened = np.concatenate(imports_list, axis=None)
        # if additional_libraries is not None:
            # If additional libraries are specified, concatenate them into the imports ndarray
            # imports_flattened = np.concatenate((imports_flattened, additional_libraries))
        tf_data = tf.data.Dataset.from_tensor_slices(imports_flattened)
        vectorize_layer.adapt(tf_data.batch(64))
        model = tf.keras.models.Sequential()
        model.add(tf.keras.Input(shape=(1,), dtype=tf.string))
        model.add(vectorize_layer)

        def space_stripper(s):
            return s.strip()

        def super_space_stripper(l):
            return list(map(space_stripper, l))

        stripped_imports = list(map(super_space_stripper, imports_series))

        def concatter(l):
            return " ".join(l)

        space_joined_imports = list(map(concatter, stripped_imports))
        vectorized_imports = model.predict(space_joined_imports)

        return vectorized_imports, vectorize_layer, model

    @staticmethod
    def create_vectorization_model(df) -> tf.keras.Model:
        maven_imports_path: str = get_file_path_relative(
            join(
                data_folder,
                clean_data_folder,
                base_library_prediction_data_folder,
                "java",
                f"{clean_data_file_name}.txt",
            )
        )
        libraries: np.ndarray = np.loadtxt(
            maven_imports_path, delimiter=", ", dtype=str
        )

        return RLP_Model._vectorize_imports(
            df[related_library_imports_column_name], libraries
        )
        # vectorized_imports, vectorize_layer, model are returned in that order

    @staticmethod
    def _get_pairs_of_imports(vectorized_imports):
        pairs = []

        def generate_and_add_to_pairs(l):
            return pairs.extend(combinations(l, 2))

        def make_pairs(l):
            # TODO: Change this to binary search, because otherwise, this could get slow (31*num_files comparisons)
            index = 0
            len_l = len(l)
            while index < len_l:
                if l[index] == 0:
                    break
                index += 1
            if index > 0:
                generate_and_add_to_pairs(l[0:index])

        # TODO: Should this be a mapped function instead of a for .. in range ..?
        for file_imports in vectorized_imports:
            make_pairs(file_imports)
        logger.success(
            f"Finished generating pairs of all imports ({len(pairs)} pairs). Example:"
        )
        logger.debug(pairs[0])
        return pairs

    def fit(
        self,
        train_df: pd.DataFrame,
        imports_colname: str = related_library_imports_column_name,
    ) -> None:
        """
        It is technically inaccurate to call this 'fit' as we are not fitting a tensorflow model.
        """
        vectorized_imports, vectorize_layer, model = self.create_vectorization_model(
            train_df
        )
        pairs_imports = self._get_pairs_of_imports(vectorized_imports)
        graph = self._make_graph(pairs_imports)

        self.graph_representation = graph
        self.vocabulary_list = vectorize_layer.get_vocabulary()
        self.tokenization_model = model

    @staticmethod
    def _make_graph(pairs_imports):
        logger.debug("About to create a graph")
        graph_of_imports = nx.Graph()
        # graph_of_imports.add_edges_from(pairs)
        # TODO: Shouldn't this also be a mapped function??
        # Can't this be parallelized/threaded?
        for import_a, import_b in pairs_imports:
            if graph_of_imports.has_edge(import_a, import_b):
                graph_of_imports[import_a][import_b]["weight"] += 1
            else:
                graph_of_imports.add_edge(import_a, import_b, weight=1)
        logger.success("Made a graph!")
        return graph_of_imports

    def __call__(self, query: str, num_returns: int) -> List[str]:
        return self._get_n_nearest_libraries(query, num_returns)

    def _get_n_nearest_libraries(
        self, base_library: Union[str, int], n: int
    ) -> List[str]:
        """
        Return n most nearest libraries and their weights

        Params:
            base_library: Either the name of the library or its index in the vocab
            n: How many closest libraries you want

        Returns:
            [
                ("Import Name", edge_weight)
                ("java.lang.ArrayList", 18984)
                ("java.util.Scanner", 12)
            ]
        """

        def format_import(n):
            return f"{n}:{self.vocabulary_list[n]}"

        # Note that this can either be index of import or name of import
        import_to_try = base_library
        max_num_imports_to_show = n  # This is only a number

        # If possible, convert the input into an index. If not an index, give up, it's the name of an import
        try:
            import_to_try = int(import_to_try)
        except ValueError:
            import_to_try = self.tokenization_model.predict([import_to_try])[0][0]

        edges = list(self.graph_representation.edges(import_to_try, data=True))
        edges = sorted(edges, key=lambda i: i[2]["weight"], reverse=True)
        # TODO: It is probably faster to do some sort of ranking with n best maintained and iterate through the list than this inefficient sort-and-crop method
        edges = edges[:max_num_imports_to_show]
        return [self.vocabulary_list[e[1]] for e in edges]
        # To return name, weight:
        # return [(self.vocabulary[e[1]], e[2]["weight"]) for e in edges]

    def run_interactive_test_loop(self):
        """
        Only for debugging -> runs interactively to help ensure everything is working
        Should never be used in production
        """
        logger.info("Stepping into infinite loop to test...")
        def format_import(n): return f"{n}:{self.vocabulary_list[n]}"
        while True:
            try:
                import_to_try = input(
                    "What import would you like to try? >>> "
                )  # Note that this can either be index of import or name of import
                max_num_imports_to_show = int(
                    input(
                        "What is the maximum number of imports you would like to see? >>> ")
                )  # This is only a number
                [print(x) for x in self(
                    import_to_try, max_num_imports_to_show)]
            except Exception as err:
                logger.error("Import was out of range")
                logger.error(err)

if __name__ == "__main__":
    rlp = RLP_Model()
    clean_data_path = get_file_path_relative(join(data_folder, clean_data_folder, related_library_prediction_data_folder, f'{clean_data_file_name}.gzip'))
    df = read_from_disk(clean_data_path, 'gzip')
    df[related_library_imports_column_name] = df[
                related_library_imports_column_name
            ].apply(lambda x: ast.literal_eval(x))
    # print(df.iloc[0]['imports'])
    # print(df.head())
    rlp.fit(df)
    save_path = get_file_path_relative(join(data_folder, models_folder, related_library_prediction_data_folder))
    os.makedirs(save_path, exist_ok = True)
    rlp.save_pretrained(save_path)
    del rlp
    rlp = RLP_Model()
    rlp.load_pretrained(save_path)
    rlp.run_interactive_test_loop()