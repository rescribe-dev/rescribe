#!/usr/bin/env python
"""
clean data from maven
"""

#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file = Path(__file__).resolve()
    root = next(
        elem for elem in current_file.parents if str(elem).endswith("dataprocess")
    )
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

import os
import yaml
import json
import numpy as np

from elasticsearch import Elasticsearch, RequestsHttpConnection, helpers
from loguru import logger
from typing import List, Dict, Any, Tuple
from tqdm import tqdm

from utils.utils import get_file_path_relative, list_files
from utils.types import NLPType, LanguageType, PackageManager
from utils.variables import (
    data_folder,
    clean_data_folder,
    base_library_prediction_data_folder,
    clean_data_file_name,
    main_data_file,
    type_path_dict,
    datasets_folder,
)


@logger.catch
def main(language: LanguageType) -> None:
    """
    load and clean the dataset from the package managers
    """
    folder_name: str = base_library_prediction_data_folder
    input_folder_path: str = get_file_path_relative(
        os.path.join(data_folder, clean_data_folder, folder_name, language.value)
    )

    libraries: np.ndarray = np.loadtxt(
        os.path.join(input_folder_path, f"{clean_data_file_name}.txt"),
        delimiter=", ",
        dtype=str,
    )
    from base_library_prediction.config import ELASTICSEARCH_HOST

    elasticsearch_client = Elasticsearch(
        hosts=[ELASTICSEARCH_HOST],
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection,
    )

    jsonvalues = []
    for library in libraries:
        jsonvalues.append(
            {
                "library": library,
                "package_manager": PackageManager.maven.value,
                "language": language.value,
            }
        )
    # https://stackoverflow.com/questions/45831701/how-to-do-bulk-indexing-to-elasticsearch-from-python
    res = helpers.bulk(
        elasticsearch_client,
        jsonvalues,
        index="library",
        doc_type="_doc",
        chunk_size=1000,
        request_timeout=200,
    )
    print(json.dumps(res, indent=4))


if __name__ == "__main__":
    main(LanguageType.java)
