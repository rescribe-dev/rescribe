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

import os
import yaml
import argparse
import tensorflow as tf
from loguru import logger
from utils.types import reScribeModel, NLPType
from language_prediction.prepare_data import prepare_data
from utils.utils import get_file_path_relative, read_from_disk
from language_prediction.language_prediction_model import LanguagePredictionModel
from language_prediction.config import read_config_language_prediction as read_config
from utils.variables import data_folder, models_folder, clean_data_folder, language_prediction_data_folder, clean_data_file_name, checkpoint_file, classes_file

language_prediction_model: reScribeModel = None

@logger.catch
def main() -> None: 
    read_config()
    
    parser = argparse.ArgumentParser()
    
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--max-sequence-length', type=int, default=64)
    args = parser.parse_args()
    
    # load our classes so that we can pass them to train and the language prediction model
    clean_folder = get_file_path_relative(os.path.join(data_folder, clean_data_folder, language_prediction_data_folder))
    _ = read_from_disk(os.path.join(clean_folder, f'{clean_data_file_name}.tgz'), extension='tgz', extract_only=True)
    
    classes = []
    with open(os.path.join(clean_folder, classes_file)) as stream:
        classes = yaml.safe_load(stream)
    
    # declare global again because we want to change the value of the global variable
    global language_prediction_model
    language_prediction_model = LanguagePredictionModel(
                                    max_sequence_length=args.max_sequence_length,
                                    classes=classes
                                )
                                


    checkpoint_dir = get_file_path_relative(os.path.join(data_folder, models_folder, language_prediction_data_folder, 'language_prediction_model_checkpoints'))
    cp_callback = tf.keras.callbacks.ModelCheckpoint(filepath=os.path.join(checkpoint_dir, checkpoint_file),
                                                        save_weights_only=True,
                                                        verbose=1)
                                                        
    x_train, x_test, y_train, y_test = prepare_data(clean_folder, f'{clean_data_file_name}.tgz', classes)

    language_prediction_model.compile(optimizer='rmsprop', 
                                        loss=tf.keras.losses.CategoricalCrossentropy(), 
                                        metrics=[
                                            tf.keras.metrics.Accuracy(),
                                            tf.keras.metrics.AUC(),
                                            tf.keras.metrics.Precision(),
                                            tf.keras.metrics.Recall()
                                        ])
                                        
    language_prediction_model.training = True
    language_prediction_model.fit(language_prediction_model.tokenize(x_train), 
                                    y_train, 
                                    batch_size=args.batch_size, 
                                    epochs=1, 
                                    verbose=1, 
                                    validation_split=0.20,
                                    callbacks=[cp_callback])
    
    language_prediction_model.training = False
    
if __name__ == '__main__':
    main()