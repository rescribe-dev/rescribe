#!/usr/bin/env python3
"""
make a request to the ANTLR API and return parsed files
parse out all of the import statements from the incoming JSON files
"""

import json
from glob import glob
from pprint import pprint
from loguru import logger
from os.path import join
from typing import Dict, List
from aiohttp import ClientSession
from asyncio import get_event_loop
from shared.file_extensions import FileExtensions
from shared.utils import get_file_path_relative, list_files
from shared.variables import data_folder, datasets_folder, clean_data_folder, library_analysis_data_folder

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
    

async def main():# main(extensions: List[FileExtensions]):
    extensions = [FileExtensions.java, FileExtensions.cpp]
    data_path: str = get_file_path_relative(f"{data_folder}/{datasets_folder}/{library_analysis_data_folder}")
    clean_data_path: str = get_file_path_relative(f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}")
    filepaths: List[str] = []
    for item in extensions:
        for extension in item.value:
            filepaths += [join(data_path, x) for x in list_files(data_path, extension)]
            # extension = 'java' or 'cpp'

    imports = []
    async with ClientSession() as session:
        for filepath in filepaths:
            parsed_file = await post(session, "http://localhost:8081/processFile", filepath)
            json_data = json.loads(parsed_file)
            import_statements = [x["path"] + '.' + x["selection"] for x in json_data["imports"]]
            imports.append(import_statements)
    logger.info(f"Imports: {imports}")

if __name__ == "__main__":
    extensions = [FileExtensions.java]
    loop  = get_event_loop()
    loop.run_until_complete(main())