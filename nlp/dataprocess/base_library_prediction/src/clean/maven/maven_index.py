#!/usr/bin/env python3
"""
clean data from maven
"""
import yaml
import json
import numpy as np

from elasticsearch import Elasticsearch, RequestsHttpConnection, helpers
from loguru import logger
from typing import List, Dict, Any, Tuple
from os.path import join
from tqdm import tqdm

from shared.utils import get_file_path_relative, list_files, clean_directory
from shared.type import NLPType, LanguageType, PackageManager
from shared.variables import (
    data_folder,
    clean_data_folder,
    main_data_file,
    type_path_dict,
    datasets_folder,
)


@logger.catch
def main(cleaning_type: NLPType, language: LanguageType) -> None:
    """
    load and clean the dataset from the package managers
    """
    folder_name: str = type_path_dict[cleaning_type]
    input_folder_path: str = get_file_path_relative(
        join(data_folder, clean_data_folder, folder_name, language.value)
    )

    libraries: np.ndarray = np.loadtxt(join(input_folder_path, main_data_file), delimiter=", ", dtype=str)

    from config import ELASTICSEARCH_HOST

    elasticsearch_client = Elasticsearch(
        hosts=[ELASTICSEARCH_HOST],
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )

    jsonvalues = []
    for library in libraries:
        jsonvalues.append({
            'library': library,
            'package_manager': PackageManager.maven.value,
            'language': language.value
        })
    # https://stackoverflow.com/questions/45831701/how-to-do-bulk-indexing-to-elasticsearch-from-python
    res = helpers.bulk(elasticsearch_client, jsonvalues, index='library', doc_type="_doc", chunk_size=1000, request_timeout=200)
    print(json.dumps(res, indent=4))

    

if __name__ == "__main__":
    main(NLPType.base_library, LanguageType.java)
