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
import yaml
import tarfile
import pandas as pd

from glob import glob
from typing import List
from loguru import logger
from tempfile import TemporaryDirectory
from sklearn.preprocessing import LabelEncoder

from utils.languages import languages
from utils.clean_utils import language_label_to_numeric
from utils.utils import get_file_path_relative, compress_labels, clean_folder, read_from_disk
from utils.variables import data_folder, clean_data_folder, datasets_folder, language_prediction_data_folder, raw_data_file_name, clean_data_file_name, credentials_file, compression_extension, classes_file

DEFAULT_CHUNKSIZE: int = 1000

def clean_data(chunksize: int = DEFAULT_CHUNKSIZE) -> pd.DataFrame:
    
    logger.info("Loading dataframe from disk")
    folder_name = language_prediction_data_folder
    
    raw_data_path: str = get_file_path_relative(f'{data_folder}/{datasets_folder}/{folder_name}/{raw_data_file_name}.{compression_extension}')
    
    # Note that df_chunks is a TextFileReader, NOT the entire dataset stored in ram
    df_chunks = read_from_disk(raw_data_path, compression_extension, chunksize=chunksize)
    
    labelencoder = LabelEncoder()
    labelencoder.fit(list(languages.keys()))
    classes: List[str] = labelencoder.classes_.tolist()
    
    output_folder: str = get_file_path_relative(f'{data_folder}/{clean_data_folder}/{folder_name}')
    output_path: str = os.path.join(output_folder, f'{clean_data_file_name}.tgz')
    
    # delete all old clean data
    clean_folder(output_folder, '*')
    
    output_preview: pd.DataFrame = pd.DataFrame()
    
    with tarfile.open(output_path, 'w:gz') as tar:
        
        with TemporaryDirectory(prefix='rev_processing_') as temp_dir:
            archive_name: str = classes_file
            
            temp_file_name = os.path.join(temp_dir, archive_name)
            os.makedirs(os.path.dirname(temp_file_name), exist_ok=True)
            with open(temp_file_name, 'w') as yaml_file:
                yaml.dump(classes, yaml_file)
            tar.add(temp_file_name, arcname=archive_name)
            
            for i, chunk in enumerate(df_chunks):
                logger.info(f'starting batch: {i}')
                frame = compress_labels(chunk, languages)
                
                try:
                    frame = language_label_to_numeric(
                        frame, labelencoder, str_column='tags', cat_column='tags_cat'
                    )
                    
                    archive_name: str = f'{i}.csv'
                    temp_file_name = os.path.join(temp_dir, archive_name)
                    logger.info(f'Writing to temp directory: {temp_file_name}')
                    frame.to_csv(temp_file_name, index=False)
                    logger.info(f'Adding to tarfile')
                    tar.add(temp_file_name, arcname=archive_name)
                    logger.success('Done!')
                    
                except Exception as err:
                    logger.error(err)
                    logger.error(f'failed to read chunk: {i}')
                    continue
                
                if i < 100:
                    output_preview = output_preview.append(frame.head(1), ignore_index=True)
    
    return output_preview
    

@logger.catch
def main() -> pd.DataFrame:
    logger.info("\n\nInitiating Data Cleaning\n")
    output_preview = clean_data()
    logger.info("\n\nSample Constructed From Processed Batches\n")
    logger.info("\nMETADATA:\n" + str(output_preview.dtypes))
    logger.info(f"\n {str(output_preview.sample(5, replace=True))}\n")
    logger.success("\n\nData Clean Complete\n")
    
if __name__ == "__main__":
    main()