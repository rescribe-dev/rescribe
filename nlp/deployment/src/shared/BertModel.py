#!/usr/bin/env python
"""
    Training and model construction for bert classifiers
"""
import ast
import yaml
import boto3
import tarfile

import numpy as np
import pandas as pd
import tensorflow as tf

from glob import glob
from tqdm import tqdm
from loguru import logger
from os import remove
from os.path import join, exists, basename, dirname
from typing import List

from sklearn.model_selection import train_test_split
from transformers.modeling_albert import AlbertPreTrainedModel
from transformers import AlbertTokenizer, AlbertConfig, TFAlbertModel

from shared.BaseModel import BaseModel
from shared.Prediction import Prediction
from shared.type import NLPType, ModelMode
from shared.utils import list_files, get_file_path_relative
from shared.variables import clean_data_folder, batch_size, do_lower_case, max_sequence_length, holdout, albert, \
    data_folder, models_folder, checkpoint_file, classes_file, type_path_dict, bucket_name, datasets_bucket_name


class BertModel(BaseModel):
    """
    Bert Model class
    """
    mode: ModelMode = None

    def __init__(self, train_type: NLPType, mode: ModelMode, delete_checkpoints: bool = False):
        """
        init, takes train type, delete checkpoints, and train_on_init
        """
        self.mode = mode
        super().__init__()
        logger.info(
            f"Num GPUs Available: {len(tf.config.experimental.list_physical_devices('GPU'))}")

        self.train_type: NLPType = train_type
        self.folder_name: str = type_path_dict[self.train_type]
        self.batch_size = batch_size

        logger.info("Retrieving ALBERT Tokenizer...")
        self.tokenizer = AlbertTokenizer.from_pretrained(
            albert, do_lower_case=do_lower_case, add_special_tokens=True, max_length=max_sequence_length, pad_to_max_length=True)

        if self.mode == ModelMode.initial_training:
            logger.info("Beginning inital BERT model training")
            self.delete_checkpoints = delete_checkpoints

            self.raw_data: pd.DataFrame = self._load_data()
            # will log label stats, will also modify self.
            self.data, self.classes, self.num_classes = self._prepare_data()

            [self.train_input_ids, self.train_attention_mask, self.train_token_type_ids], [self.test_input_ids,
                                                                                           self.test_attention_mask, self.test_token_type_ids], self.y_train, self.y_test = self._get_train_test()
            self.train_data = [self.train_input_ids,
                               self.train_attention_mask, self.train_token_type_ids]
            self.test_data = [self.test_input_ids,
                              self.test_attention_mask, self.test_token_type_ids]

            self.model = self.create_model()
            self._fit()
            self.evaluate()
            self.save_to_s3()

        elif self.mode == ModelMode.load_pretrained:
            logger.info("Loading pretrained BERT model")

            self.model_abs = get_file_path_relative(
                f'{data_folder}/{models_folder}/{self.folder_name}/{checkpoint_file}')
            logger.info("path: {self.model_abs}")
            tarfile_model_output_dir: str = get_file_path_relative(
                f'{data_folder}/{models_folder}/{self.folder_name}/model.tar.gz')

            self.model_index = self.model_abs + ".index"
            if not exists(self.model_index):
                tar_input_path_abs = get_file_path_relative(
                    tarfile_model_output_dir)
                if not exists(tar_input_path_abs):
                    from shared.config import PRODUCTION
                    if not PRODUCTION:
                        raise ValueError(
                            f'cannot find saved model tar file at path: {tar_input_path_abs}')
                    s3_client = boto3.client('s3')
                    with open(tar_input_path_abs, 'wb') as file:
                        s3_client.download_fileobj(
                            bucket_name, basename(tar_input_path_abs), file)

                with tarfile.open(tar_input_path_abs) as tar:
                    tar.extractall(get_file_path_relative(
                        f'{data_folder}/{models_folder}'))

            if not exists(self.model_index):
                raise ValueError('cannot find model files')

            self.classes, self.num_classes = self._get_classes()

            self.model = self.create_model()
            self.model.load_weights(self.model_abs)
            self.model.summary()

        else:
            logger.error(
                f"Invalid mode argument <{mode}>. Expected {ModelMode.get_values()}")
            raise RuntimeError(
                f"Invalid mode argument <{mode}>. Expected {ModelMode.get_values()}")

    def predict(self, query: str, **kwargs) -> List[Prediction]:
        """
        Predict using the trained model
        """
        [input_ids, input_mask, token_type_ids] = self.tokenize([query])
        confidence: List[float] = self.model.predict(
            [input_ids, input_mask, token_type_ids]).tolist()[0]
        res: List[Prediction] = [Prediction(self.classes[i], conf)
                                 for i, conf in enumerate(confidence)]
        res.sort(key=lambda elem: elem.score, reverse=True)

        return res

    def create_model(self):
        """
        use create model and compile
        """
        logger.info("Creating Model...")
        model = self._create_model(self.num_classes)
        model.summary()

        model.compile(optimizer='Adam', loss=tf.keras.losses.BinaryCrossentropy(), metrics=[tf.keras.metrics.BinaryCrossentropy(),
                                                                                            tf.keras.metrics.Accuracy(), tf.keras.metrics.AUC(), tf.keras.metrics.Recall(), tf.keras.metrics.Precision()])
        return model

    def evaluate(self):
        """
        print an evaluation of the model which has been trained
        """
        logger.info("Evaluating model")
        logger.success(
            f"Evaluation: {self.model.evaluate(x=[self.test_input_ids, self.test_attention_mask, self.test_token_type_ids], y=self.y_test, batch_size=self.batch_size)}")

    def tokenize(self, sentences: List[str]) -> np.ndarray:
        """
        tokenize inputs
        """
        input_ids, input_masks, input_segments = [], [], []
        for sentence in tqdm(sentences):
            inputs = self.tokenizer.encode_plus(sentence, add_special_tokens=True, max_length=max_sequence_length, pad_to_max_length=True,
                                                return_attention_mask=True, return_token_type_ids=True, truncation=True)
            input_ids.append(inputs['input_ids'])
            input_masks.append(inputs['attention_mask'])
            input_segments.append(inputs['token_type_ids'])

        return np.asarray(input_ids, dtype='int32'), np.asarray(input_masks, dtype='int32'), np.asarray(input_segments, dtype='int32')

    def _load_data(self):
        """
        load "clean" data from the approriate clean data folder
        """
        clean_data_dir = get_file_path_relative(
            f'{data_folder}/{clean_data_folder}/{self.folder_name}')
        clean_data_paths = list_files(clean_data_dir, "*.csv")

        if len(clean_data_paths) == 0:
            tar_input_path_abs = join(clean_data_dir, 'data.tar.gz')
            if not exists(tar_input_path_abs):
                from shared.config import PRODUCTION
                if not PRODUCTION:
                    raise ValueError(
                        f'cannot find saved model tar file at path: {tar_input_path_abs}')
                s3_client = boto3.client('s3')
                s3_file_path = join(
                    self.folder_name, basename(tar_input_path_abs))
                logger.info(s3_file_path)
                with open(tar_input_path_abs, 'wb') as file:
                    s3_client.download_fileobj(
                        datasets_bucket_name, s3_file_path, file)

            with tarfile.open(tar_input_path_abs) as tar:
                tar.extractall(clean_data_dir)

            clean_data_paths = list_files(clean_data_dir, "*.csv")

            if len(clean_data_paths) == 0:
                raise ValueError(f'cannot find path {clean_data_dir}')

        _indexes = [int(basename(path).split(".")[0])
                    for path in clean_data_paths]
        clean_data_file_paths = [join(clean_data_dir, path)
                                 for path in clean_data_paths]

        data: pd.DataFrame = pd.DataFrame()

        logger.info(
            f"Loading data from {len(clean_data_file_paths)} batches...")

        for path in tqdm(clean_data_file_paths):
            try:
                frame = pd.read_csv(path)
            except Exception as err:
                raise RuntimeError(f"Error reading csv at - {path}") from err

            try:
                frame = frame.drop(columns=["id", "tags"])
            except ValueError as err:
                logger.error(
                    f"Could not drop 'id' and 'tags' columns of {path}, verify data integrity")
                raise err

            data = pd.concat([data, frame])

        dataset_len: int = len(data)
        if dataset_len == 0:
            raise RuntimeError(f'no data found for {self.train_type}')
        logger.info(f"Dataset Generated - length: {dataset_len}")

        return data

    def _get_classes(self):
        """
        get classes
        """
        classes_file_path = get_file_path_relative(
            f'{data_folder}/{models_folder}/{self.folder_name}/{classes_file}')
        classes = []
        with open(classes_file_path, 'r') as stream:
            classes = yaml.safe_load(stream)
        num_classes = len(classes)

        return classes, num_classes

    def _prepare_data(self):
        """
        prepare loaded data for training and tokenization
        """
        # read classes
        classes, num_classes = self._get_classes()
        data = self.raw_data.reset_index(drop=True)
        data["tags_cat"] = data["tags_cat"].apply(self.str_to_array)
        values = data["tags_cat"].values

        for index in range(num_classes):
            label = np.asarray([0]*(num_classes))
            label[index] = 1
            logger.info(
                f"Number of data points with label {label} - {self.label_count(values, label)}")
            logger.info(
                f"percentage of data points with label {label} - {self.label_count(values, label) / len(values)}")

        return data, classes, num_classes

    def _get_train_test(self):
        """
        split the prepared data into train and test, tokenize and process into a format recognizable by bert
        then return
        """
        logger.info("Generating Test / Train Datasets...")
        X_train, X_test, y_train, y_test = train_test_split(
            self.data.title.to_numpy(), self.data.tags_cat.to_numpy(), test_size=holdout)

        logger.info("Tokenizing Test / Train Datasets...")
        # length: 14
        # hi how are you

        # bert expects 20
        # hi how are you000000

        # attention mask
        # 11111111111111000000

        # token_type_ids
        # 0000000000000000000000
        [train_input_ids, train_attention_mask, train_token_type_ids] \
            = self.tokenize(X_train)
        [test_input_ids, test_attention_mask, test_token_type_ids] \
            = self.tokenize(X_test)

        # because tensorflow didnt work without this
        y_train = list(y_train)
        y_train = np.asarray(y_train)
        y_test = list(y_test)
        y_test = np.asarray(y_test)

        return [train_input_ids, train_attention_mask, train_token_type_ids], [test_input_ids, test_attention_mask, test_token_type_ids], y_train, y_test

    def _pre_train(self):
        """
        set up checkpoint path, remove old checkpoints if delete_checkpoints is true
        write the classes trained on to disk
        return a callback function to save the checkopints
        """
        checkpoint_folder_path = get_file_path_relative(
            f'{data_folder}/{models_folder}/{self.folder_name}')

        if self.delete_checkpoints:
            self.delete_all_checkpoints(checkpoint_folder_path)

        # write classes
        new_classes_file_path = get_file_path_relative(
            f"{data_folder}/{models_folder}/{self.folder_name}/{classes_file}")
        with open(new_classes_file_path, 'w') as yaml_file:
            yaml.dump(self.classes, yaml_file)

        checkpoint_path = join(checkpoint_folder_path, checkpoint_file)
        cp_callback = tf.keras.callbacks.ModelCheckpoint(filepath=checkpoint_path,
                                                         save_weights_only=True,
                                                         verbose=1)
        return cp_callback, checkpoint_path

    def _train(self):
        """
        train the model
        """
        logger.info("\n\nInitiating Training\n")
        self.model.training = True
        self.model.fit([self.train_input_ids, self.train_attention_mask, self.train_token_type_ids], self.y_train,
                       batch_size=self.batch_size, epochs=1, verbose=1, validation_split=0.15, callbacks=[self.cp_callback])

        logger.success(
            f"Training Success! - Checkpoints saved at {self.checkpoint_path}")
        self.model.training = False

    def _fit(self):
        """
        train the model
        """
        self.cp_callback, self.checkpoint_path = self._pre_train()
        self._train()

    # TODO - different create model based on the nlp type
    # TODO Might need to be duplicated, similar to above (for lang/lib -- different)

    def _create_model(self, num_outputs) -> tf.keras.Model:
        """
        Return an ALBERT model framework with pretrained weights
        """
        config = self._get_albert_config(num_outputs)

        input_ids, input_masks, input_segments, embedding_layer = self._get_embedding_layer(
            config)

        X = self._add_fine_tuning_cap(embedding_layer, num_outputs)

        model = tf.keras.Model(
            inputs=[input_ids, input_masks, input_segments], outputs=X)

        model = self._freeze_layers(model, 4)

        # input_ids, input_masks, input_segments, model = get_embedding_layer(config)

        return model

    def save_to_s3(self):
        """
        Save the trained model to s3
        """
        checkpoint_path = get_file_path_relative(
            f'{data_folder}/{models_folder}/{self.folder_name}')

        output_file: str = get_file_path_relative(
            f'{data_folder}/{models_folder}/{self.folder_name}/model.tar.gz')

        try:
            remove(output_file)
            logger.warning(f"Output file found at {output_file} deleting...")
        except FileNotFoundError:
            logger.info(
                "Did not find output file to remove, directory appears to be clean")
        except Exception as err:
            logger.error("Fatal error in save_to_s3 for bert")
            raise err

        # zip the whole folder
        with tarfile.open(output_file, 'w:gz') as tar:
            tar.add(checkpoint_path, arcname=basename(checkpoint_path))

        from shared.config import PRODUCTION

        if PRODUCTION:
            s3_client = boto3.resource('s3')
            s3_filepath = join(basename(dirname(output_file)),
                               basename(output_file))
            obj = s3_client.Object(bucket_name, s3_filepath)
            with open(output_file, 'rb') as tar:
                obj.put(Body=tar)

    @staticmethod
    def _get_embedding_layer(config):
        """
        Based off of the input configuration, generate an embedding layer with input shapes based off of the global variable max_sequence_length
        This pulls in the pretrained weights
        """
        transformer_model = TFAlbertModel.from_pretrained(
            albert, config=config)
        input_ids = tf.keras.layers.Input(
            shape=(max_sequence_length,), name='input_ids', dtype='int32')
        input_masks = tf.keras.layers.Input(
            shape=(max_sequence_length,), name='input_masks_ids', dtype='int32')
        input_segments = tf.keras.layers.Input(
            shape=(max_sequence_length,), name='input_segments', dtype='int32')

        embedding_layer = transformer_model(
            input_ids, attention_mask=input_masks, token_type_ids=input_segments)[0]

        return input_ids, input_masks, input_segments, embedding_layer

    @staticmethod
    def _get_albert_config(num_outputs: int):
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

    @staticmethod
    def _add_fine_tuning_cap(embedding_layer, num_outputs):
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

    @staticmethod
    def _freeze_layers(model, n: int):
        """
        freeze the weights of the first n layers to stop them from being modified during training
        """
        for layer in model.layers[:n]:
            logger.info(f"Freezing layer - {layer.name}")
            layer.trainable = False

        return model

    @staticmethod
    def label_count(values, label):
        """
        Return the count of all of the data points with a certain label
        """
        count = 0
        for row in values:
            if np.array_equal(row, label):
                count += 1

        return count

    @staticmethod
    def str_to_array(x: str) -> np.ndarray:
        """
        The input is a string of form \"[1, 0, 0]\"
        the output should be an np ndarray object containing the same information
        """

        return np.asarray(ast.literal_eval(x), dtype=np.int32)

    @staticmethod
    def delete_all_checkpoints(checkpoint_folder_path: str) -> None:
        """
        delete all checkpoint data
        """
        for file_path in glob(join(checkpoint_folder_path, '*')):
            remove(file_path)
