#!/usr/bin/env python3
"""
make a request to the ANTLR API and return parsed files
parse out all of the import statements from the incoming JSON files
"""

import json
from glob import glob
from loguru import logger
from typing import Dict, List
from aiohttp import ClientSession
from asyncio import get_event_loop
from shared.file_extensions import FileExtensions
from shared.utils import get_file_path_relative, list_files
from shared.variables import data_folder, datasets_folder, clean_data_folder, library_analysis_data_folder

async def fetch(session: ClientSession, url: str):
    async with session.get(url) as response:
        return await response.text()

async def post(session: ClientSession, url: str, dataformat: Dict):
    pass

async def main():# main(extensions: List[FileExtensions]):
    extensions = [FileExtensions.java, FileExtensions.cpp]
    data_path: str = get_file_path_relative(f"{data_folder}/{datasets_folder}/{library_analysis_data_folder}")
    clean_data_path: str = get_file_path_relative(f"{data_folder}/{clean_data_folder}/{library_analysis_data_folder}")
    filepaths: List[str] = []
    for item in extensions:
        for extension in item.value:
            filepaths += list_files(data_path, extension)
            # extension = 'java' or 'cpp'
            print(extension)
    # dataformat: Dict = {
    #     path: clean
    # } 
    async with ClientSession() as session:
        html = await fetch(session, 'http://python.org')
        # print(html)

if __name__ == "__main__":
    extensions = [FileExtensions.java]
    loop  = get_event_loop()
    loop.run_until_complete(main())