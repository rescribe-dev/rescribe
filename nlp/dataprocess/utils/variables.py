""" All program constants """


""" Used in BigQuery code to fetch credentials. """
AWS_BIGQUERY_SECRET_NAME: str = "BIGQUERY_CREDENTIALS"
AWS_SECRET_REGION_NAME: str = "us-east-1"
""" End BigQuery Constants """

"""
global variables
"""
from typing import Dict
from utils.types import NLPType

random_state: int = 42

dataset_length: int = 10000
# dataset length verification
assert(dataset_length % 1000 == 0 and dataset_length >= 5000)

albert: str = "albert-base-v2"
max_sequence_length: int = 64
holdout: float = 0.2

do_lower_case: bool = True

# saved models bucket
bucket_name: str = 'rescribe-nlp-sagemaker'
# datasets bucket
datasets_bucket_name: str = 'rescribe-datasets'

data_folder: str = 'data'
datasets_folder: str = 'datasets'
clean_data_folder: str = 'clean_data'
models_folder: str = 'models'

# Training - Deployment
# Inter-Library-Relation-Project
inter_library_graph_file = 'graph.pkl'
inter_library_vocabulary_file = 'vocab.yml'
inter_library_tokenization_model_path = 'tokenization_model'

credentials_file: str = 'utils/bigquery/bigquery_credentials.json'
classes_file: str = 'classes.yml'
checkpoint_file: str = 'cp.ckpt'
main_data_file: str = 'data_file.csv'

batch_size: int = 32

# we_max_sequence_length: int = 64
# we_batch_size: int = 64
# we_tf_data_folder: str = "tf_dataset"

language_prediction_data_folder  = 'language_prediction'
raw_data_file_name = 'raw_data'
compression_extension: str = 'gzip'

type_path_dict: Dict[NLPType, str] = {
    NLPType.language_prediction: 'language_prediction',
    NLPType.base_library: 'base_library_prediction',
    NLPType.library_relation: 'inter_library_relation',
}
