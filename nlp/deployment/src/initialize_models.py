#!/usr/bin/env python3
"""
Load in the bert model from disk
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

from typing import Optional, Tuple, List
from bert.load_model.main import main as load_model
from library_relation.load_model.main import main as load_library_relation_model
from transformers import AlbertTokenizer
from tensorflow.keras.models import Model
from shared.type import NLPType
from sys import argv

language_model: Tuple[Optional[Model], Optional[AlbertTokenizer],
                      Optional[List[str]]] = (None, None, None)

base_library_model: Tuple[Optional[Model], Optional[AlbertTokenizer],
                     Optional[List[str]]] = (None, None, None)


def main(model_type: Optional[NLPType] = None):
    """
    Load all of the ml models to global objects
    """
    global base_library_model
    global language_model
    global library_relation_model
            
    if model_type == NLPType.language or model_type:
        language_model = load_model(NLPType.language)

    if model_type == NLPType.base_library or model_type:
        library_model = load_model(NLPType.base_library)

    if model_type == NLPType.library_relation or model_type:
        library_relation_model = load_library_relation_model(NLPType.library_relation)

    else:
        raise ValueError(f"Input model_type <{model_type}> is invalid, expected <{NLPType.get_values()}>")


if __name__ == "__main__":
    if len(argv) < 2:
        raise ValueError('no nlp type provided')
    main(NLPType(argv[1]))
