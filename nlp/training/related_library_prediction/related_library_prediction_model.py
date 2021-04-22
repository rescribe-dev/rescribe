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
    root = next(
        elem for elem in current_file.parents if str(elem).endswith("training")
    )
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

import ast
import yaml
import random
import tarfile
import boto3

import pandas as pd
import numpy as np
import networkx as nx
import tensorflow as tf

from loguru import logger
from os import remove
from os.path import exists, join, dirname, basename
from itertools import combinations
from typing import List, Union, Tuple, Optional
from tensorflow.python.keras.layers.preprocessing import text_vectorization

from utils.types import NLPType, reScribeModel
from utils.utils import get_file_path_relative, list_files
from utils.variables import (
    inter_library_graph_file,
    inter_library_vocabulary_file,
    inter_library_tokenization_model_path,
    related_library_imports_column_name
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


    def load_pretrained(directory: str):
        """
            Note, this assumes you're training locally... no touching S3 right now
        """
        # TODO: Add support for S3 loading using the PRODUCTION variable.
        graph_location = os.path.join(directory, inter_library_graph_file)
        tok_location = os.path.join(directory, inter_library_tokenization_model_path)
        vocab_location = os.path.join(directory, vocab_file)
        self.graph_representation = nx.read_gpickle(graph_location)
        self.tokenization_model = tf.keras.models.load_model(tok_location)
        self.tokenization_model.compile()
        with open(vocab_location, "r") as f:
            self.vocabulary = yaml.full_load(f)
        if not (self.graph and self.model and self.vocabulary):
            raise EnvironmentError(
                "Something went wrong loading in the saved state for related library prediction")
    
    def fit(train_df, imports_colname: str = related_library_imports_column_name):
        """
        It is technically inaccurate to call this 'fit' as we are not fitting a tensorflow model.
        """
        # Figure out if the dataframe has already had the imports converted to lists:
        row = df.iloc[[0]]
        imports_obj = row[related_library_imports_column_name]
        # If not already converted, 
        if len(list(imports_obj)) == len(list(str(imports_obj))):
            imported_data[related_library_imports_column_name] = imported_data[related_library_imports_column_name].apply(lambda x: ast.literal_eval(x))
        raise NotImplementedError()
        
    def __call__(query: str, num_returns: int) -> List[str]:
        raise NotImplementedError()
        
        
        
        
        
        
        
        
from .BaseModel import BaseModel
        # r.fit(x_train, y_train, params)
        # r("java.utils.List", 10)
        if mode == ModelMode.initial_training:
            self.imports_column_name = "imports"
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

            full_graph_file: str = join(
                graph_output_path, inter_library_graph_file)
            model_folder: str = join(
                graph_output_path, inter_library_tokenization_model_path)
            vocab_file: str = join(
                graph_output_path, inter_library_vocabulary_file)

            from shared.config import PRODUCTION

            if any([not exists(full_graph_file), not exists(model_folder), not exists(vocab_file)]):
                tar_input_path_abs = join(graph_output_path, "model.tar.gz")
                if not exists(tar_input_path_abs):
                    if not PRODUCTION:
                        raise ValueError(
                            f'cannot find saved model tar file at path: {tar_input_path_abs}')

                    s3_client = boto3.client('s3')
                    s3_filepath = join(
                        basename(dirname(tar_input_path_abs)), basename(tar_input_path_abs))
                    with open(tar_input_path_abs, 'wb') as file:
                        s3_client.download_fileobj(
                            bucket_name, s3_filepath, file)

                with tarfile.open(tar_input_path_abs, 'r:gz') as tar:
                    tar.extractall(graph_output_path)

            

        else:
            raise RuntimeError(
                f"Invalid ModelMode <{mode}> expected <{ModelMode.get_values()}>")

    def run_interactive_test_loop(self):
        """
        Only for debugging -> runs interactively to help ensure everything is working

        Should never be used in production
        """
        logger.info("Stepping into infinite loop to test...")
        def format_import(n):
            return f"{n}:{self.vocabulary[n]}"
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
        clean_data_dir: Optional[str] = None
        library_data_folder = type_path_dict[data_type]
        if clean_data_path == None:
            train_name: str = "train"

            clean_data_dir = get_file_path_relative(
                f"{data_folder}/{clean_data_folder}/{library_data_folder}")
            clean_data_path = get_file_path_relative(
                f"{clean_data_dir}/{main_data_file}")
            logger.info(f"Loading data from: {clean_data_path}")
        else:
            clean_data_dir = dirname(clean_data_path)

        if not exists(clean_data_path):
            tar_input_path_abs = join(clean_data_dir, 'data.tar.gz')
            if not exists(tar_input_path_abs):
                from shared.config import PRODUCTION
                if not PRODUCTION:
                    raise ValueError(
                        f'cannot find saved model tar file at path: {tar_input_path_abs}')
                s3_client = boto3.client('s3')
                s3_file_path = join(library_data_folder,
                                    basename(tar_input_path_abs))
                with open(tar_input_path_abs, 'wb') as file:
                    s3_client.download_fileobj(
                        datasets_bucket_name, s3_file_path, file)

            with tarfile.open(tar_input_path_abs) as tar:
                tar.extractall(clean_data_dir)

            if not exists(clean_data_path):
                raise ValueError(f'cannot find path {clean_data_path}')

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
        graph_file = join(
            graph_output_path, inter_library_graph_file)
        nx.write_gpickle(self.graph, graph_file)

        logger.info("Saving vectorization model")
        model_folder = join(graph_output_path,
                            inter_library_tokenization_model_path)
        self.model.save(model_folder)

        logger.info("Saving vocabulary")
        vocab_file = join(graph_output_path, inter_library_vocabulary_file)
        with open(vocab_file, "w") as f:
            yaml.dump(self.vocabulary, stream=f,
                      explicit_start=True, default_flow_style=False)

        output_file = join(graph_output_path, "model.tar.gz")
        try:
            remove(output_file)
            logger.warning(f"Output file found at {output_file} deleting...")
        except FileNotFoundError:
            logger.info(
                "Did not find output file to remove, directory appears to be clean")
        except Exception as err:
            logger.error("Fatal error in _save_graph_state")
            raise err

        # zip the whole folder
        with tarfile.open(output_file, 'w:gz') as tar:
            tar.add(graph_file, arcname=basename(graph_file))
            tar.add(model_folder, arcname=basename(model_folder))
            tar.add(vocab_file, arcname=basename(vocab_file))

        from shared.config import PRODUCTION

        if PRODUCTION:
            s3_client = boto3.resource('s3')
            s3_filepath = join(basename(dirname(output_file)),
                               basename(output_file))
            obj = s3_client.Object(bucket_name, s3_filepath)
            with open(output_file, 'rb') as tar:
                obj.put(Body=tar)

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
        """
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
