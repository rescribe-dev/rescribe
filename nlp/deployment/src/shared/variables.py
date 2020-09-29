#!/usr/bin/env python3
"""
global variables
"""
from shared.type import NLPType

dataset_length: int = 10000

# dataset length verification
assert(dataset_length % 1000 == 0 and dataset_length >= 5000)

albert: str = "albert-base-v2"
max_sequence_length: int = 64
holdout: float = 0.2

do_lower_case: bool = True

bucket_name: str = 'rescribe-nlp-sagemaker'

data_folder: str = 'data'
datasets_folder: str = 'datasets'
clean_data_folder: str = 'clean_data'
models_folder: str = 'models'

language_data_folder: str = NLPType.language
library_data_folder: str = NLPType.library
library_analysis_data_folder: str = NLPType.library_analysis

classes_file: str = 'classes.yml'
checkpoint_file: str = 'cp.ckpt'
main_data_file: str = 'data_file.csv'

batch_size: int = 32
