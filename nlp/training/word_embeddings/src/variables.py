#!/usr/bin/env python3
"""
utils functions
"""

data_folder: str = "data"
raw_data_folder: str = f"{data_folder}/raw_data"
clean_data_folder: str = f"{data_folder}/clean_data"
models_folder = f"{data_folder}/models"
text_vectorization_folder = f"{models_folder}/vectorization"
output_folder: str = "output"
rnn_folder = f"{models_folder}/rnn"
rnn_file_name = "cp.ckpt"

sentences_key: str = "imports"
random_state: int = 0
unknown_token: str = "[UNK]"
