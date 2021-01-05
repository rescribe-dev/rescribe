"""
Contains the GraphModel object which is capable of storing a graph of values
"""
import ast
import string
import random

import pandas as pd
import numpy as np
import networkx as nx
import tensorflow as tf
import yaml

from os.path import exists, join
from loguru import logger
from tensorflow import convert_to_tensor
from typing import List, Union, Tuple

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
    inter_library_tokenization_model_path
)

from .BaseModel import BaseModel

class GraphModel(BaseModel):
    """
    Container class for our graph based model
    """
    mode: ModelMode = None
    def __init__(self, model_type: NLPType, mode: ModelMode):
        super().__init__()
        graph_types = []
        assert(model_type in graph_typ)
        AUTOTUNE = tf.data.experimental.AUTOTUNE
        embedding_dimensionality: int = 5

    