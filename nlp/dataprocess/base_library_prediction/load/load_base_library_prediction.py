#!/usr/bin/env python
"""
load data
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
from loguru import logger
from Naked.toolshed.shell import execute_js
from utils.utils import get_file_path_relative

def run_js_datasets() -> bool:
    success = execute_js(
        os.path.join("..", "..", "datasets", "libraries", "java", "lib", "index.js")    
    )
    
    return success

@logger.catch
def main() -> None:
    # load the data
    success = run_js_datasets()
    if not success:
        raise RuntimeError("Unable to run the datasets node script successfully")


if __name__ == "__main__":
    main()