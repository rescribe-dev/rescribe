#!/usr/bin/env python
"""
    Make predictions with command line arguments as inputs
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
from typing import Optional, List, Dict

from config import read_config
from initialize_models import main as initialize_models

from shared.type import NLPType
from shared.BaseModel import BaseModel
from shared.Prediction import Prediction


def main(query: str, predict_type: NLPType, **kwargs) -> List[Prediction]:
    """
    Prediction
    """
    model: Optional[BaseModel]
    if predict_type == NLPType.language:
        from initialize_models import language_model as model
    elif predict_type == NLPType.base_library:
        from initialize_models import base_library_model as model
    elif predict_type == NLPType.library_relation:
        from initialize_models import library_relation_model as model
    else:
        raise RuntimeError(
            f'Cannot find model to match NLPType {predict_type}')
    if model is None:
        raise RuntimeError('model is not initialized')

    return model.predict(query, **kwargs)


if __name__ == "__main__":
    if len(argv) < 2:
        raise ValueError('no type provided')
    read_config()
    predict_input_type = NLPType(argv[1])
    initialize_models(predict_input_type)
    input_dict: Dict[NLPType, List[str]] = {
        NLPType.library_relation: [],
        NLPType.base_library: [],
        NLPType.language: ["python", "how do you make a class in C++",
                           "how to create a webpage in java", "List COMPREHENSION",
                           "I'm Litera11y 7r0llING"]
    }
    for current_query in input_dict[predict_input_type]:
        logger.info(
            f"{current_query}: {main(current_query, predict_input_type)}")
