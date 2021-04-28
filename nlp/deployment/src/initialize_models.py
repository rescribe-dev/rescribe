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
import sys
import tensorflow as tf
from loguru import logger
from language_prediction.language_prediction_model import LanguagePredictionModel
from related_library_prediction.related_library_prediction_model import RLP_Model
from utils.utils import reScribeModel

tokenizer: reScribeModel = None
language_prediction_model: reScribeModel = None
rlp_model: reScribeModel = None

def main(args, classes, lpm_path, rlp_path):
    global tokenizer, language_prediction_model, rlp_model
    
    tokenizer = LanguagePredictionModel(
                                    max_sequence_length=args.max_sequence_length,
                                    classes=classes
                                )
    language_prediction_model = tf.keras.models.load_model(lpm_path)
    logger.success("language_prediction model loaded")
    rlp_model = RLP_Model()
    rlp_model.load_pretrained(rlp_path)
    logger.success("related_library model loaded")            
    
    