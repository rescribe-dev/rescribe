import sys
from utils.types import reScribeModel
from language_prediction.language_prediction_model import LanguagePredictionModel
language_prediction_model: reScribeModel = None

def main(args, classes, checkpoint_path):
    global language_prediction_model
    
    language_prediction_model = LanguagePredictionModel(
                                    max_sequence_length=args.max_sequence_length,
                                    classes=classes
                                )
    try:
        language_prediction_model.load_weights(checkpoint_path)
    except Exception as err:
        with open('file.txt', 'w') as file:
            file.write(str(err))
            
    return

    
    