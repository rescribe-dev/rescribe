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

import argparse
from loguru import logger
from utils.types import reScribeModel, NLPType
from language_prediction.config import read_config_language_prediction as read_config
from language_prediction.anguage_prediction_model import LanguagePredictionModel

language_prediction_model: reScribeModel = None

@logger.catch
def main() -> None: 
    read_config()
    
    parser = argparse.ArgumentParser()
    
    parser.add_argument('--learning-rate', type=int, default=1)
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--max-sequence-length', type=int, default=64)
    parser.add_argument('--num-labels', type=int, default=64)
    args = parser.parse_args()
    
    # declare global again because we want to change the value of the global variable
    global language_prediction_model
    language_prediction_model = LanguagePredictionModel(
                                    learning_rate=args.learning_rate,
                                    batch_size=args.batch_size,
                                    max_sequence_length=args.max_sequence_length,
                                    num_labels=args.num_labels
                                )