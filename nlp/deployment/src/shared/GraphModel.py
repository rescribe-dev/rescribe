"""
Contains the GraphModel object which is capable of storing a graph of values
"""

import ast
import yaml
import random

import pandas as pd
import numpy as np
import networkx as nx
import tensorflow as tf

from loguru import logger
from os.path import exists, join
from itertools import combinations
from typing import List, Union, Tuple
from tensorflow.python.keras.layers.preprocessing import text_vectorization

from shared.type import NLPType, ModelMode
from shared.utils import get_file_path_relative, list_files
from shared.variables import (
    random_state,
    data_folder,
    clean_data_folder,
    type_path_dict,
    main_data_file,
    models_folder,
    inter_library_graph_file,
    inter_library_vocabulary_file,
    inter_library_tokenization_model_path,
)

from .BaseModel import BaseModel


class GraphModel(BaseModel):
    """
    Container class for our graph based model
    """

    mode: ModelMode = None
    nlp_graph_types = [NLPType.library_relation]

    def __init__(self, model_type: NLPType, mode: ModelMode):
        assert model_type in [NLPType.library_relation]
        super().__init__()
        self.model_type = model_type

        if mode == ModelMode.initial_training:
            self.imports_column_name = "imports"

            self._initialize_randomState_GPU()
            self.imports_df = self._get_data(model_type)

            self.total_number_imports, self.max_len = self._count_imports_and_max_len()

            (self.vectorized_imports, self.vectorize_layer,
             self.model,) = self._vectorize_imports()
            # An array of imports in the order they were
            self.vocabulary = self.vectorize_layer.get_vocabulary()

            # TODO: Can't this be better done with a numpy array?
            self.vectorized_imports = self.vectorized_imports.tolist()
            self.imports = self.vectorized_imports
            self.pairs = self._get_pairs_of_imports()
            self.graph = self._make_graph()

            logger.info("Saving graph state")
            self._save_graph_state()
            logger.success("Graph state saved")

        elif mode == ModelMode.load_pretrained:
            folder_name: str = type_path_dict[self.model_type]
            graph_output_path = get_file_path_relative(
                f"{data_folder}/{models_folder}/{folder_name}")
            self.graph = nx.read_gpickle(
                join(graph_output_path, inter_library_graph_file))
            self.model = tf.keras.models.load_model(
                join(graph_output_path, inter_library_tokenization_model_path))
            self.model.compile()
            with open(join(graph_output_path, inter_library_vocabulary_file), "r") as f:
                self.vocabulary = yaml.full_load(f)
            if not (self.graph and self.model and self.vocabulary):
                raise EnvironmentError(
                    "Something went wrong loading in the saved state")

        else:
            raise RuntimeError(
                f"Invalid ModelMode <{mode}> expected <{ModelMode.get_values()}>")

    def run_interactive_test_loop(self):
        """
        Only for debugging -> runs interactively to help ensure everything is working

        Should never be used in production
        """
        logger.info("Stepping into infinite loop to test...")
        def format_import(n): return f"{n}:{self.vocabulary[n]}"
        while True:
            try:
                import_to_try = input(
                    "What import would you like to try? >>> "
                )  # Note that this can either be index of import or name of import
                max_num_imports_to_show = int(
                    input(
                        "What is the maximum number of imports you would like to see? >>> ")
                )  # This is only a number
                [print(x) for x in self._get_n_nearest_libraries(
                    import_to_try, max_num_imports_to_show)]
            except Exception as err:
                logger.error("Import was out of range")
                logger.error(err)

    def _initialize_randomState_GPU(self) -> None:
        """
        initialize before running anything
        """
        tf.random.set_seed(random_state)
        random.seed(random_state)
        np.random.seed(random_state)
        logger.info(
            f"Num GPUs Available: {len(tf.config.experimental.list_physical_devices('GPU'))}")

    def _get_data(self, data_type: NLPType, clean_data_path=None):
        if clean_data_path == None:
            train_name: str = "train"
            library_data_folder = type_path_dict[data_type]

            clean_data_dir = get_file_path_relative(
                f"{data_folder}/{clean_data_folder}/{library_data_folder}")
            clean_data_path = get_file_path_relative(
                f"{clean_data_dir}/{main_data_file}")
            logger.info(f"Loading data from: {clean_data_path}")
        assert exists(clean_data_path)
        imported_data = pd.read_csv(clean_data_path, index_col=0)
        imported_data["imports"] = imported_data["imports"].apply(
            lambda x: ast.literal_eval(x))
        # need index_col = 0 to avoid duplicating the index column
        logger.success("Data loaded")
        return imported_data

    def _count_imports_and_max_len(self):
        logger.info("Counting number of imports")
        length_of_imports_list: List[int] = [
            len(x) for x in self.imports_df[self.imports_column_name]]
        total_number_imports: int = sum(length_of_imports_list)
        max_len: int = max(length_of_imports_list)
        return total_number_imports, max_len

    def _vectorize_imports(self):
        logger.info("Creating Vectorize layer")

        vectorize_layer = tf.keras.layers.experimental.preprocessing.TextVectorization(
            max_tokens=self.total_number_imports,
            output_mode="int",
            output_sequence_length=self.max_len,
            split=text_vectorization.SPLIT_ON_WHITESPACE,
            standardize=None,
        )

        logger.success("Created vectorize layer")
        logger.info("Preparing to adapt data to vectorize layer")
        imports_series = self.imports_df["imports"].to_list()
        imports_flattened = np.concatenate(imports_series)
        tf_data = tf.data.Dataset.from_tensor_slices(imports_flattened)
        vectorize_layer.adapt(tf_data.batch(64))
        model = tf.keras.models.Sequential()
        model.add(tf.keras.Input(shape=(1,), dtype=tf.string))
        model.add(vectorize_layer)

        def space_stripper(s): return s.strip()
        def super_space_stripper(l): return list(map(space_stripper, l))
        stripped_imports = list(map(super_space_stripper, imports_series))
        def concatter(l): return " ".join(l)
        space_joined_imports = list(map(concatter, stripped_imports))
        vectorized_imports = model.predict(space_joined_imports)

        return vectorized_imports, vectorize_layer, model

    def _get_pairs_of_imports(self):
        pairs = []

        def generate_and_add_to_pairs(
            l): return pairs.extend(combinations(l, 2))

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
        for i in range(len(self.imports)):
            make_pairs(self.imports[i])
        logger.success(
            f"Finished generating pairs of all imports ({len(pairs)} pairs). Example:")
        logger.debug(pairs[0])
        return pairs

    def _make_graph(self):
        logger.debug("About to create a graph")
        graph_of_imports = nx.Graph()
        # graph_of_imports.add_edges_from(pairs)
        # TODO: Shouldn't this also be a mapped function??
        for import_a, import_b in self.pairs:
            if graph_of_imports.has_edge(import_a, import_b):
                graph_of_imports[import_a][import_b]["weight"] += 1
            else:
                graph_of_imports.add_edge(import_a, import_b, weight=1)
        logger.success("Made a graph!")
        return graph_of_imports

    def _save_graph_state(self) -> None:
        """
        Saves the graph, model, and vocabulary to disk. These are the minimum required to 
        run the model in the cloud without first training it.
        """
        folder_name: str = type_path_dict[self.model_type]
        graph_output_path = get_file_path_relative(
            f"{data_folder}/{models_folder}/{folder_name}")

        logger.info("Saving graph")
        nx.write_gpickle(self.graph, join(
            graph_output_path, inter_library_graph_file))

        logger.info("Saving vectorization model")
        self.model.save(
            join(graph_output_path, inter_library_tokenization_model_path))

        logger.info("Saving vocabulary")
        with open(join(graph_output_path, inter_library_vocabulary_file), "w") as f:
            yaml.dump(self.vocabulary, stream=f,
                      explicit_start=True, default_flow_style=False)

    def _get_n_nearest_libraries(self, base_library: Union[str, int], n: int) -> List[Tuple[str, int]]:
        """
        Return n most nearest libraries and their weights

        Params:
            base_library: Either the name of the library or its index in the vocab
            n: How many closest libraries you want

        Returns:
            [
                ("java.util.Scanner", 12)
                ("java.lang.ArrayList", 18984)
            ]
        """
        def format_import(n): return f"{n}:{self.vocabulary[n]}"
        # Note that this can either be index of import or name of import
        import_to_try = base_library
        max_num_imports_to_show = n  # This is only a number

        # If possible, convert the input into an index. If not an index, give up, it's the name of an import
        try:
            import_to_try = int(import_to_try)
        except ValueError:
            import_to_try = self.model.predict([import_to_try])[0][0]

        edges = list(self.graph.edges(import_to_try, data=True))
        edges = sorted(edges, key=lambda i: i[2]["weight"], reverse=True)
        edges = edges[:max_num_imports_to_show]
        return [(self.vocabulary[e[1]], e[2]["weight"]) for e in edges]

    def predict(self, library: Union[int, str], **kwargs) -> List[Tuple[str, int]]:
        """#
        Calls a wrapper method to predict the n-nearest libraries

        https://stackoverflow.com/questions/47832762/python-safe-dictionary-key-access

        Arguments:
            libary = Either the number of the library (index) or the actual name of the library (case, space - sensitive)
            n_nearest (optional) = The number of results requested (Does not impact efficiency)

            Returns:
            (ex)
                [
                    ("Library, corresponding_index")
                    ("java.util.Scanner", 12)
                    ("java.lang.ArrayList", 18984)
                ]
        """
        return self._get_n_nearest_libraries(library, kwargs.get("n_nearest", 10))
