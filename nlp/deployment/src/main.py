#!/usr/bin/env python
"""
main file

entry point for server
"""

#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file = Path(__file__).resolve()
    root = next(
        elem for elem in current_file.parents if str(elem).endswith("deployment")
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
from src.config import read_config
from src.server import start_server
from utils.types import NLPType
from utils.utils import get_file_path_relative
from src.initialize_models import main as initialize_models
from utils.variables import data_folder, models_folder, clean_data_folder, language_prediction_data_folder, related_library_prediction_data_folder, clean_data_file_name, checkpoint_file, classes_file

def main():
    
    parser = argparse.ArgumentParser()
    
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--max-sequence-length', type=int, default=64)
    args = parser.parse_args()
    
    clean_folder = get_file_path_relative(os.path.join(data_folder, clean_data_folder, language_prediction_data_folder))
    classes = []
    with open(os.path.join(clean_folder, classes_file)) as stream:
        classes = yaml.safe_load(stream)
    
    lpm_path = get_file_path_relative(os.path.join(data_folder, models_folder, language_prediction_data_folder, 'language_prediction_model_checkpoints'))
    rlp_path = get_file_path_relative(os.path.join(data_folder, models_folder, related_library_prediction_data_folder))
    read_config()
    initialize_models(args, classes, lpm_path, rlp_path)
    start_server()
    
if __name__ == '__main__':
    main()
