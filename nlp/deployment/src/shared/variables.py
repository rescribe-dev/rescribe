#!/usr/bin/env python3
"""
global variables
"""

from typing import List

clean_data_folder: str = '../clean_data'
model_input_path: str = '.model_inputs'
tarfile_path_model_inputs: str = '../../model_inputs.tar.gz'
bert_path: str = "https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1"
max_sequence_length: int = 64
holdout: float = 0.2

model_output_dir: str = 'saved_model'
tarfile_model_output_dir: str = '../../saved_model.tar.gz'

bucket_name: str = 'rescribe-nlp-sagemaker'

questions_file: str = '../datasets/post-questions.csv'

deploy_types: List[str] = ['file-content-classifier', 'search-classifier']
dataload_types: List[str] = [deploy_types[0], deploy_types[1]]
