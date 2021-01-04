#!/usr/bin/env python3
"""
    Training and model construction for bert classifiers
"""
import tensorflow as tf
from tqdm import tqdm
from os import remove
from os.path import join
from loguru import logger
import pandas as pd
import numpy as np
import ast
import yaml
from sklearn.model_selection import train_test_split
from shared.utils import list_files, get_file_path_relative
from shared.type import NLPType
from shared.variables import clean_data_folder, batch_size, do_lower_case, max_sequence_length, holdout, albert, \
    data_folder, models_folder, checkpoint_file, classes_file, type_path_dict
from glob import glob
from transformers import AlbertTokenizer
from predict.tokenize import tokenize
from load_model.main import create_model
from .BaseModel import BaseModel


class BertModel(BaseModel):
    """
    Bert Model class
    """

    def __init__(self, train_type: NLPType, delete_checkpoints: bool = False, train_on_init: bool = False):
        """
        init, takes train type, delete checkpoints, and train_on_init
        """
        super().__init__()
        logger.info(
            f"Num GPUs Available: {len(tf.config.experimental.list_physical_devices('GPU'))}")

        self.train_type: NLPType = train_type
        self.folder_name: str = type_path_dict[self.train_type]
        self.delete_checkpoints = delete_checkpoints
        self.batch_size = batch_size

        self.raw_data: pd.DataFrame = self._load_data()
        # will log label stats, will also modify self.
        self.data, self.classes, self.num_classes = self._prepare_data()

        [self.train_input_ids, self.train_attention_mask, self.train_token_type_ids], [self.test_input_ids,
                                                                                       self.test_attention_mask, self.test_token_type_ids], self.y_train, self.y_test = self._get_train_test()
        self.train_data = [self.train_input_ids,
                           self.train_attention_mask, self.train_token_type_ids]
        self.test_data = [self.test_input_ids,
                          self.test_attention_mask, self.test_token_type_ids]

        self.model = self._create_model()

        if train_on_init:
            self.fit()

        self.evaluate()

    def initialize(self):
        """
        initialize the model and its data
        """

    def predict(self):
        """
        Predict using the trained model
        """

    def fit(self):
        """
        train the model
        """
        self.cp_callback, self.checkpoint_path = self._pre_train()
        self._train()

    def _load_data(self):
        """
        load "clean" data from the approriate clean data folder
        """
        clean_data_folder_rel = get_file_path_relative(
            f'{data_folder}/{clean_data_folder}/{self.folder_name}')
        _clean_data_paths = list_files(clean_data_folder_rel, "csv")
        _indexes = [int(path.split(".")[0]) for path in _clean_data_paths]
        clean_data_file_paths = [join(clean_data_folder_rel, path)
                                 for path in _clean_data_paths]

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

    def _prepare_data(self):
        """
        prepare loaded data for training and tokenization
        """
        # read classes
        classes_file_path = get_file_path_relative(
            f'{data_folder}/{models_folder}/{self.folder_name}/{classes_file}')
        classes = []
        with open(classes_file_path, 'r') as stream:
            classes = yaml.safe_load(stream)
        num_classes = len(classes)

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

        logger.info("Retrieving ALBERT Tokenizer...")
        tokenizer = AlbertTokenizer.from_pretrained(
            albert, do_lower_case=do_lower_case, add_special_tokens=True, max_length=max_sequence_length, pad_to_max_length=True)

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
            = tokenize(X_train, tokenizer)
        [test_input_ids, test_attention_mask, test_token_type_ids] \
            = tokenize(X_test, tokenizer)

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

    def _create_model(self):
        """
        use create model and compile
        """
        logger.info("Creating Model...")
        model = create_model(self.num_classes)
        model.summary()

        model.compile(optimizer='Adam', loss=tf.keras.losses.BinaryCrossentropy(), metrics=[tf.keras.metrics.BinaryCrossentropy(),
                                                                                            tf.keras.metrics.Accuracy(), tf.keras.metrics.AUC(), tf.keras.metrics.Recall(), tf.keras.metrics.Precision()])
        return model

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

    def evaluate(self):
        """
        print an evaluation of the model which has been trained
        """
        logger.info(
            f"Evaluation: {self.model.evaluate(x=[self.test_input_ids, self.test_attention_mask, self.test_token_type_ids], y=self.y_test, batch_size=self.batch_size)}")

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
