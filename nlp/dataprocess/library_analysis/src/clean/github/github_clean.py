#!/usr/bin/env python3
"""
make a request to the ANTLR API and return parsed files
parse out all of the import statements from the incoming JSON files
"""

import json
import pickle
import pandas as pd
from typing import List
from os.path import join
from asyncio import get_event_loop
from tqdm import tqdm
from loguru import logger
from aiohttp import ClientSession
from shared.file_extensions import FileExtensions
from shared.utils import get_file_path_relative, list_files
from shared.type import NLPType
from shared.variables import data_folder, datasets_folder, clean_data_folder, type_path_dict, main_data_file


async def fetch(session: ClientSession, url: str):
    async with session.get(url) as response:
        return await response.text()


async def post(session: ClientSession, url: str, filepath: str):
    contents = None
    with open(filepath, 'r') as file:
        contents = str(file.read())

    request = {
        "id": "testid",
        "path": filepath,
        "fileName": filepath.split('/')[-1],
        "content": contents
    }
    async with session.post(url, json=request) as response:
        return await response.text()


async def main(extensions: List[FileExtensions]):
    library_analysis_data_folder = type_path_dict[NLPType.library_analysis]
    logger.info("Retrieving filepaths")

    data_path: str = get_file_path_relative(
        f"{data_folder}/{datasets_folder}/{library_analysis_data_folder}")
    # Folder where the data will be stored, clean
    clean_data_path: str = get_file_path_relative(
        f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}")

    output_file_path: str = f"{clean_data_path}/{main_data_file}"

    filepaths: List[str] = []
    for item in extensions:
        for extension in item.value:
            filepaths += [join(data_path, file_name)
                          for file_name in list_files(data_path, extension)]
            # extension = 'java' or 'cpp'

    logger.info("Making post requests")
    imports = []
    async with ClientSession() as session:
        for abs_file_path in tqdm(filepaths):
            parsed_file = await post(session, "http://localhost:8081/processFile", abs_file_path)
            json_data = json.loads(parsed_file)
            import_statements = ['.'.join([x["path"], x["selection"]])
                                 for x in json_data["imports"]]
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
