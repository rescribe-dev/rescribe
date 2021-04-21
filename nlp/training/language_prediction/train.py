import os
import tensorflow as tf
from utils.utils import get_file_path_relative
from utils.variables import data_folder, models_folder, clean_data_folder, language_prediction_data_folder, clean_data_file_name, compression_extension, classes_file

def train(language_prediction_model: reScribeModel):
    checkpoint_dir = get_file_path_relative(data_folder, models_folder, language_prediction_data_folder, 'language_prediction_model_checkpoints')
    # checkpoint_prefix = os.path.join(checkpoint_dir, 'ckpt')
    
    
    cp_callback = tf.keras.callbacks.ModelCheckpoint(filepath=checkpoint_dir,
                                                        save_weights_only=True,
                                                        verbose=1)