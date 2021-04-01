#!/usr/bin/env python
"""
clean data
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

from loguru import logger
from utils.clean_utils import save_to_s3
from utils.types import NLPType, LanguageType
from base_library_prediction.clean.maven.base_library_prediction_maven_clean import main as clean_data
from base_library_prediction.clean.maven.base_library_prediction_maven_index import main as index_data


@logger.catch
def main() -> None:
    clean_data(LanguageType.java)
    save_to_s3(NLPType.base_library_prediction)
    index_data(LanguageType.java)
    
    

if __name__ == "__main__":
    main()
    