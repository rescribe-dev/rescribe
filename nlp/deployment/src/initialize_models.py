import sys
import tensorflow as tf
from loguru import logger
from utils.types import reScribeModel
from language_prediction.language_prediction_model import LanguagePredictionModel

tokenizer: reScribeModel = None
language_prediction_model: reScribeModel = None

def main(args, classes, checkpoint_path):
    global tokenizer
    global language_prediction_model
    
    tokenizer = LanguagePredictionModel(
                                    max_sequence_length=args.max_sequence_length,
                                    classes=classes
                                )
    language_prediction_model = tf.keras.models.load_model(checkpoint_path)

    logger.success("language_prediction model loaded")            
    
    