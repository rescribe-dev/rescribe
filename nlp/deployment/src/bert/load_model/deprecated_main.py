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

import tensorflow as tf
from loguru import logger
import yaml
import boto3
import tarfile
from transformers import AlbertTokenizer, AlbertConfig, TFAlbertModel
from transformers.modeling_albert import AlbertPreTrainedModel
from tensorflow.keras.models import Model
from shared.type import NLPType
from shared.variables import do_lower_case, max_sequence_length, albert, \
    data_folder, models_folder, type_path_dict, \
    checkpoint_file, classes_file, bucket_name
from typing import Tuple
from shared.utils import get_file_path_relative
from os.path import exists, basename
from sys import argv

s3_client = boto3.client('s3')


def get_embedding_layer(config):
    """
    Based off of the input configuration, generate an embedding layer with input shapes based off of the global variable max_sequence_length
    This pulls in the pretrained weights
    """
    transformer_model = TFAlbertModel.from_pretrained(albert, config=config)
    input_ids = tf.keras.layers.Input(
        shape=(max_sequence_length,), name='input_ids', dtype='int32')
    input_masks = tf.keras.layers.Input(
        shape=(max_sequence_length,), name='input_masks_ids', dtype='int32')
    input_segments = tf.keras.layers.Input(
        shape=(max_sequence_length,), name='input_segments', dtype='int32')

    embedding_layer = transformer_model(
        input_ids, attention_mask=input_masks, token_type_ids=input_segments)[0]

    return input_ids, input_masks, input_segments, embedding_layer


def get_albert_config(num_outputs: int):
    """
    Return the ALBERT pretrained configuration
    """
    albert_base_config = AlbertConfig(
        hidden_size=768, num_attention_heads=12, intermediate_size=3072, num_labels=num_outputs)
    model = AlbertPreTrainedModel(albert_base_config)
    config = model.config
    config.output_hidden_states = False

    logger.info(f"\n\nConfig: \n{config}")

    return config


# TODO - add different fine tuning based on the nlp type - duplicate function for languages/libraries, change based on type of classifcation we're doing
def add_fine_tuning_cap(embedding_layer, num_outputs):
    """
    Add on a "fine tuning cap" to the end of the model with the number of output nodes specified
    """
    X = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(
        50, return_sequences=True, dropout=0.1, recurrent_dropout=0.1))(embedding_layer)
    X = tf.keras.layers.GlobalMaxPool1D()(X)  # Dimension Reduction
    X = tf.keras.layers.Dense(50, activation='relu')(X)
    X = tf.keras.layers.Dropout(0.2)(X)
    X = tf.keras.layers.Dense(num_outputs, activation='sigmoid')(X)

    return X


def freeze_layers(model, n: int):
    """
    freeze the weights of the first n layers to stop them from being modified during training
    """
    for layer in model.layers[:n]:
        logger.info(f"Freezing layer - {layer.name}")
        layer.trainable = False

    return model

# TODO - different create model based on the nlp type

# TODO Might need to be duplicated, similar to above (for lang/lib -- different)


def create_model(num_outputs) -> Model:
    """
    Return an ALBERT model framework with pretrained weights
    """
    config = get_albert_config(num_outputs)

    input_ids, input_masks, input_segments, embedding_layer = get_embedding_layer(
        config)

    X = add_fine_tuning_cap(embedding_layer, num_outputs)

    model = tf.keras.Model(
        inputs=[input_ids, input_masks, input_segments], outputs=X)

    model = freeze_layers(model, 4)

    # input_ids, input_masks, input_segments, model = get_embedding_layer(config)

    return model


def main(model_load_type: NLPType) -> Tuple[Model, AlbertTokenizer]:
    """
    Load bert model
    """
    from shared.config import PRODUCTION

    folder_name: str = type_path_dict[model_load_type]

    model_abs = get_file_path_relative(
        f'{data_folder}/{models_folder}/{folder_name}/{checkpoint_file}')
    logger.error(model_abs)
    tarfile_model_output_dir: str = get_file_path_relative(
        f'{data_folder}/{models_folder}/{folder_name}/model.tar.gz')

    model_index = model_abs + ".index"

    if not exists(model_index):
        tar_input_path_abs = get_file_path_relative(tarfile_model_output_dir)
        if not exists(tar_input_path_abs):
            if not PRODUCTION:
                raise ValueError(
                    f'cannot find saved model tar file at path: {tar_input_path_abs}')
            with open(tar_input_path_abs, 'wb') as file:
                s3_client.download_fileobj(
                    bucket_name, basename(tar_input_path_abs), file)

        with tarfile.open(tar_input_path_abs) as tar:
            tar.extractall(model_abs)

    if not exists(model_index):
        raise ValueError('cannot find model files')

    # read classes
    classes_file_path = get_file_path_relative(
        f'{data_folder}/{models_folder}/{folder_name}/{classes_file}')
    classes = []
    with open(classes_file_path, 'r') as stream:
        classes = yaml.safe_load(stream)
    num_classes = len(classes)

    model = create_model(num_classes)
    model.load_weights(model_abs)
    model.summary()

    tokenizer = AlbertTokenizer.from_pretrained(
        albert, do_lower_case=do_lower_case, add_special_tokens=True, max_length=max_sequence_length, pad_to_max_length=True)

    return model, tokenizer, classes


if __name__ == "__main__":
    if len(argv) < 2:
        raise ValueError('no nlp type provided')
    main(NLPType(argv[1]))
