#!/usr/bin/env python
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
from sys import argv
from loguru import logger
from typing import Optional, Any

from library_relation.load_model.main import main as load_library_relation_model

from shared.BertModel import BertModel
from shared.type import NLPType, ModelMode

# model, tokenizer, classes
language_model: BertModel = None

base_library_model: BertModel = None

library_relation_model: Any = None


def main(model_type: Optional[NLPType] = None):
    """
    Load all of the ml models to global objects
    """
    global base_library_model
    global language_model
    global library_relation_model

    if model_type == NLPType.language:
        logger.info("Loading language bert model")
        language_model = BertModel(model_type, mode=ModelMode.load_pretrained)
        logger.success("Loaded language bert model")
        return

    if model_type == NLPType.base_library:
        logger.info("Loading base library bert model")
        base_library_model = BertModel(
            model_type, mode=ModelMode.load_pretrained)
        logger.success("Loaded base library bert model")
        return

    if model_type == NLPType.library_relation:
        logger.info("Loading library relation model")
        library_relation_model = load_library_relation_model(
            NLPType.library_relation)
        logger.success("Loaded library relation model")
        return

    raise ValueError(
        f"Input model_type <{model_type}> is invalid, expected <{NLPType.get_values()}>")


if __name__ == "__main__":
    if len(argv) < 2:
        raise ValueError('no nlp type provided')
    main(NLPType(argv[1]))
