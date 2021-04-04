#!/usr/bin/env python
"""
make a request to the ANTLR API and return parsed files
parse out all of the import statements from the incoming JSON files
"""

#################################
# for handling relative imports #
#################################
if __name__ == '__main__':
    import sys
    from pathlib import Path
    current_file = Path(__file__).resolve()
    root = next(elem for elem in current_file.parents
                if str(elem).endswith('src'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################


import os
import json
import pickle
import pandas as pd

from tqdm import tqdm
from typing import List
from loguru import logger
from asyncio import get_event_loop
from aiohttp import ClientSession, ClientTimeout

from utils.types import NLPType
from utils.file_extensions import FileExtensions
from utils.utils import decompress, get_file_path_relative, save_to_disk, list_files, original_filename, clean_folder
from utils.variables import data_folder, datasets_folder, raw_data_file_name, clean_data_folder, related_library_prediction_data_folder, clean_data_file_name


async def fetch(session: ClientSession, url: str):
    async with session.get(url) as response:
        return await response.text()
        
async def post(session: ClientSession, url: str, raw_filepath: str):
    contents = None
    with open(raw_filepath, 'r') as file:
        contents = str(file.read())

    filepath, _ = original_filename(raw_filepath)
    request = {
        "id": "testid",
        "path": filepath,
        "fileName": filepath.split('/')[-1],
        "content": contents
    }
    async with session.post(url, json=request) as response:
        return await response.text()
        
async def main(extensions: List[FileExtensions]) -> None:
    folder_name: str = related_library_prediction_data_folder
    raw_data_folder: str = get_file_path_relative(
        os.path.join(data_folder, datasets_folder, folder_name)    
    )
    raw_data_path: str = os.path.join(raw_data_folder, f'{raw_data_file_name}.tgz')
    output_folder: str = get_file_path_relative(
        os.path.join(data_folder, clean_data_folder, folder_name)
    )
    
    output_path: str = os.path.join(output_folder, f'{clean_data_file_name}.gzip')
    
    logger.info('Extracting raw data')
    clean_folder(output_folder, '*.gzip')
    decompress(raw_data_path, 'tgz')
    
    logger.info('Retrieving file paths')

    filepaths: List[str] = []
    for item in extensions:
        for extension in item.value:
            filepaths += [os.path.join(raw_data_folder, file_name)
                          for file_name in list_files(raw_data_folder, f'*.{extension}')]
    
    logger.info('Making post requests')
    imports = []
    timeout = ClientTimeout(total=15)
    async with ClientSession(timeout=timeout) as session:
        for abs_file_path in tqdm(filepaths):
            try:
                parsed_file = await post(session, "http://localhost:8081/processFile", abs_file_path)
            except Exception as err:
                logger.error(
                    f"Error for path: {abs_file_path}\nAre you sure ANTLR is running?"
                )
                raise err
            
            json_data = json.loads(parsed_file)
            import_key: str = "imports"
            
            if import_key not in json_data:
                continue
            
            import_statements = ['.'.join([x["path"], x["selection"]])
                                 for x in json_data[import_key]]
            
            if(len(import_statements) > 1):
                imports.append(import_statements)

    logger.success("Post requests complete")
    logger.info(f"Preview:\n\n {imports[0]}\n")
    logger.info(f"Writing to file {output_path}")
    
    output_data = {"imports": imports}
    output_df: pd.DataFrame = pd.DataFrame(output_data, columns=["imports"])
    save_to_disk({clean_data_file_name: output_df}, output_path, 'gzip')
    
    logger.success(
        f"{len(imports)} files were processed and stored to {output_path}"
    )
    
    logger.info('cleaning extracted csv files')
    clean_folder(raw_data_folder, '*.dat')
    logger.success(f'Cleaned: {raw_data_folder}')
    
if __name__ == "__main__":
    loop = get_event_loop()
    loop.run_until_complete(main([FileExtensions.java]))