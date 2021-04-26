#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file = Path(__file__).resolve()
    root = next(
        elem for elem in current_file.parents if str(elem).endswith("training")
    )
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################


import argparse
from utils.types import NLPType
from utils.utils import get_file_path_relative
from utils.variables import data_folder, models_folder, clean_data_folder, related_library_prediction_data_folder, clean_data_file_name

def main():
    
    parser = argparse.ArgumentParser()
    
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--max-sequence-length', type=int, default=64)
    args = parser.parse_args()
    

    
if __name__ == '__main__':
    main()