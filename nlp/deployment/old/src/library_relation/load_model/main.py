"""
    main function for library relation model
"""
#################################
# for handling relative imports #
#################################
if __name__ == '__main__':
    import sys
    from pathlib import Path
    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents
                if str(elem).endswith('src'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

import tensorflow as tf
from loguru import logger
from shared.type import NLPType
from shared.variables import (
    data_folder,
    type_path_dict,
    models_folder,
    inter_library_graph_file,
    inter_library_vocabulary_file,
    inter_library_tokenization_model_path
)
from shared.utils import get_file_path_relative
import networkx as nx
import yaml
from os.path import join


def main(model_load_type: NLPType = NLPType.library_relation):
    """
    Load model for interlibrary analysis
    """
    # from shared.config import PRODUCTION

    folder_name: str = type_path_dict[model_load_type]
    graph_output_path = get_file_path_relative(
        f'{data_folder}/{models_folder}/{folder_name}')
    graph = nx.read_gpickle(join(graph_output_path, inter_library_graph_file))
    model = tf.keras.models.load_model(
        join(graph_output_path, inter_library_tokenization_model_path))
    model.compile()
    vocab = None
    with open(join(graph_output_path, inter_library_vocabulary_file), 'r') as f:
        vocab = yaml.full_load(f)
    if not (graph and model and vocab):
        raise EnvironmentError("Something went wrong loading in the ")
    return graph, model, vocab


if __name__ == "__main__":
    main()
    logger.success("No errors on loading the graph, seq model, or vocab")
