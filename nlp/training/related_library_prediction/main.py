#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents if str(elem).endswith("training"))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

import argparse
import ast
import os
from os.path import exists, join

from utils.types import NLPType
from utils.utils import get_file_path_relative, read_from_disk
from utils.variables import (clean_data_file_name, clean_data_folder,
                             data_folder, models_folder,
                             related_library_imports_column_name,
                             related_library_prediction_data_folder)

from related_library_prediction_model import RLP_Model


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--max-sequence-length", type=int, default=64)
    args = parser.parse_args()
    rlp = RLP_Model()
    clean_data_path = get_file_path_relative(
        join(
            data_folder,
            clean_data_folder,
            related_library_prediction_data_folder,
            f"{clean_data_file_name}.gzip",
        )
    )
    df = read_from_disk(clean_data_path, "gzip")
    df[related_library_imports_column_name] = df[
        related_library_imports_column_name
    ].apply(lambda x: ast.literal_eval(x))
    rlp.fit(df)
    save_path = get_file_path_relative(
        join(data_folder, models_folder, related_library_prediction_data_folder)
    )
    os.makedirs(save_path, exist_ok=True)
    rlp.save_pretrained(save_path)
    # del rlp
    # rlp = RLP_Model()
    # rlp.load_pretrained(save_path)
    # rlp.run_interactive_test_loop()


if __name__ == "__main__":
    main()
