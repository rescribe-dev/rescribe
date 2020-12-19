#!/usr/bin/env python3
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

import json
import pickle
import pandas as pd
from typing import List
from os.path import join
from asyncio import get_event_loop
from tqdm import tqdm
from loguru import logger
from aiohttp import ClientSession, ClientTimeout
from shared.file_extensions import FileExtensions
from shared.utils import get_file_path_relative, list_files, original_filename, clean_directory
from shared.type import NLPType
from shared.variables import data_folder, datasets_folder, clean_data_folder, type_path_dict, main_data_file


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


async def main(extensions: List[FileExtensions], clean_dir: bool = True):
    library_data_folder = type_path_dict[NLPType.library]

    if clean_dir:
        logger.info("Cleaning directory")
        folder_name = type_path_dict[NLPType.library]
        clean_directory(
            get_file_path_relative(f'{data_folder}/{clean_data_folder}/{folder_name}'), 
            ["dat", "csv"]
        )
        logger.success("Cleaning complete")

    logger.info("Retrieving filepaths")
  
    data_path: str = get_file_path_relative(
        f"{data_folder}/{datasets_folder}/{library_data_folder}")
    # Folder where the data will be stored, clean
    clean_data_path: str = get_file_path_relative(
        f"{data_folder}/{clean_data_folder}/{library_data_folder}")

    output_file_path: str = f"{clean_data_path}/{main_data_file}"

    filepaths: List[str] = []
    for item in extensions:
        for extension in item.value:
            filepaths += [join(data_path, file_name)
                          for file_name in list_files(data_path, extension)]
            # extension = 'java' or 'cpp'

    logger.info("Making post requests")
    imports = []
    timeout = ClientTimeout(total=15)
    async with ClientSession(timeout=timeout) as session:
        for abs_file_path in tqdm(filepaths):
            try:
                parsed_file = await post(session, "http://localhost:8081/processFile", abs_file_path)
            except Exception as err:
                logger.error(f"Error for path: {abs_file_path}\nAre you sure ANTLR is running?")
                exit()
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
    logger.info(f"Writing to file {output_file_path}")

    output_data = {"imports": imports}
    output_df = pd.DataFrame(output_data, columns=["imports"])
    output_df.to_csv(output_file_path)

    logger.success(
        f"{len(imports)} files were processed and stored to {output_file_path}")

if __name__ == "__main__":
    loop = get_event_loop()
    loop.run_until_complete(main([FileExtensions.java]))