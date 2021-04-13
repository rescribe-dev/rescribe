
#################################
# for handling relative imports #
#################################
if __name__ == '__main__':
    import sys
    from pathlib import Path
    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents
                if str(elem).endswith('training'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
    
    
#################################

import os
import ast
import yaml
import boto3
import tarfile

import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow.data as tfd

from glob import glob
from tqdm import tqdm
from typing import List
from loguru import logger
from tensorflow.keras import layers
from os.path import join, exists, basename, dirname

from transformers.modeling_albert import AlbertPreTrainedModel
from transformers import AlbertTokenizer, AlbertConfig, TFAlbertModel

from utils.utils import get_file_path_relative, read_from_disk, clean_folder
from utils.variables import albert, data_folder, clean_data_folder, language_prediction_data_folder, clean_data_file_name, classes_file, datasets_bucket_name


class LanguagePredictionModel():
    
    def __init__(self):
        self.data_path = get_file_path_relative(join(data_folder, clean_data_folder, language_prediction_data_folder, f'{clean_data_file_name}.tgz'))
        self.data_dir = dirname(self.data_path)
        self.tokenizer = AlbertTokenizer.from_pretrained(
            albert, do_lower_case=True, add_special_tokens=True, max_length=64, pad_to_max_length=True
        )
    
    def train(self):
        try:
            data: List[pd.DataFrame] = read_from_disk(self.data_path, 'tgz')
        except FileNotFoundError:
            data: List[pd.DataFrame] = self._load_data_from_s3()
            
        classes = self._get_classes()
        clean_folder(self.data_dir, '*.yml')
        
        clean_data: pd.DataFrame = self._clean_data(data)
        
        
    
    def _clean_data(self, data) -> pd.DataFrame:
        clean_data: pd.DataFrame = pd.DataFrame()
        
        logger.info(
            f'concatenating data from {len(data)} frames'
        )
        
        for i, frame in enumerate(data):
            try:
                frame = frame.drop(columns=['id', 'tags'])
            except ValueError as err:
                logger.error(
                    f'Could not drop "id" and "tags" columns of frame {i}, verify data integrity'
                )
                raise err
            
            clean_data = pd.concat([clean_data, frame])
            
        clean_data = clean_data.reset_index(drop=True)
        if len(clean_data) == 0:
            raise RuntimeError(f'Failed to create dataset')
        logger.info(f'Dataset generated - length: {len(clean_data)}')
        
        return clean_data
        
    def _get_classes(self):
        classes = []
        with open(join(self.data_dir, classes_file), 'r') as file:
            classes = yaml.safe_load(file)
        return classes
    
    def _load_data_from_s3(self) -> List[pd.DataFrame]:
        tar_input_path_abs = join(self.data_dir, 'data.tgz')
        from utils.config import PRODUCTION
        if not PRODUCTION:
            raise ValueError(
                f'cannot find saved model tar file at path: {tar_input_path_abs}'
            )
        
        s3_client = boto3.client('s3')
        s3_file_path = join(self.data_dir, basename(tar_input_path_abs))
        logger.info(f's3 file path: {s3_file_path}')
        
        with open(tar_input_path_abs, 'wb') as file:
            s3_client.download_fileobj(
                datasets_bucket_name, s3_file_path, file    
            )
            
        return read_from_disk(tar_input_path_abs, 'tgz')
        
        
if __name__ == "__main__":
    model = LanguagePredictionModel()
    model.train()
