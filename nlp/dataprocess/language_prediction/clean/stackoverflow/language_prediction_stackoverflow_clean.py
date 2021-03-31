#!/usr/bin/env python
"""
clean stackoverflow data
"""

#################################
# for handling relative imports #
#################################
if __name__ == '__main__':
    import sys
    from pathlib import Path
    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents
                if str(elem).endswith('dataprocess'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

import os
import pandas as pd

from glob import glob
from loguru import logger

from utils.utils import get_file_path_relative, compress_labels, clean_folder, read_from_disk
from utils.variables import data_folder, datasets_folder, language_prediction_data_folder, raw_data_file_name, credentials_file, compression_extension

DEFAULT_CHUNKSIZE: int = 1000

def clean_data(chunksize: int = DEFAULT_CHUNKSIZE) -> None:
    
    logger.info("Loading dataframe from disk")
    folder_name = language_prediction_data_folder
    
    raw_data_path: str = get_file_path_relative(f'{data_folder}/{datasets_folder}/{folder_name}/{raw_data_file_name}.{compression_extension}')
    df_chunks  = read_from_disk(raw_data_path, compression_extension, chunksize=chunksize)
    
    print(df_chunks)

@logger.catch
def main() -> pd.DataFrame:
    logger.info("\n\nInitiating Data Cleaning\n")
    clean_data()
    logger.success("\n\nData Clean Complete\n")
    
if __name__ == "__main__":
    main()