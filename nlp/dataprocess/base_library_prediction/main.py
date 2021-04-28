#!/usr/bin/env python
"""
main file

entry point for running nlp dataload module
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


from loguru import logger
from base_library_prediction.config import read_config_base_library_prediction as read_config
from base_library_prediction.load.load_base_library_prediction import main as load_data
from base_library_prediction.clean.clean_base_library_prediction import main as clean_data

@logger.catch
def main() -> None:
    read_config()
    load_data()
    clean_data()
    
if __name__ == "__main__":
    main()
    