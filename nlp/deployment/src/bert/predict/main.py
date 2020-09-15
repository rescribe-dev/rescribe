#!/usr/bin/env python3
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
from initialize_models import main as initialize_models
from config import read_config
from transformers import AlbertTokenizer
from tensorflow.keras.models import Model
from shared.type import NLPType
from typing import List, Optional, Tuple
from bert.predict.tokenize import tokenize


def main(query: str, predict_type: NLPType) -> None:
    """
    Prediction
    """
    model_data: Tuple[Optional[Model], Optional[AlbertTokenizer],
                      Optional[List[str]]] = (None, None, None)
    if predict_type == NLPType.language:
        from initialize_models import language_model as model_data
    else:
        from initialize_models import library_model as model_data
    logger.info(f"Model Data: {model_data}")
    for elem in model_data:
        if elem is None:
            raise RuntimeError('model is not initialized')
    model: Model = model_data[0]
    tokenizer: AlbertTokenizer = model_data[1]
    [input_ids, input_mask, token_type_ids] = tokenize([query], tokenizer)
    prediction = model.predict([input_ids, input_mask, token_type_ids])
    classes: List[str] = model_data[2]
    logger.error(f"Prediction output: {classes(max(prediction[0]))}")


if __name__ == "__main__":
    if len(argv) < 2:
        raise ValueError('no type provided')
    read_config()
    predict_type = NLPType(argv[1])
    initialize_models(predict_type)
    query = "python"
    logger.info(f"{query}:\n{main(query, predict_type)}")
    query = "how do you make a class in C++"
    logger.info(f"{query}:\n{main(query, predict_type)}")
    query = "how to create a webpage in java"
    logger.info(f"{query}:\n{main(query, predict_type)}")
    query = "List COMPREHENSION"
    logger.info(f"{query}:\n{main(query, predict_type)}")
    query = "I'm Litera11y 7r0llING"
    logger.info(f"{query}:\n{main(query, predict_type)}")
    # create_roc_curve(model, [test_input_ids, test_attention_mask, test_token_type_ids], y_test, '1.png', '2.png')
