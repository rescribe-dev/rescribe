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
                if str(elem).endswith('src'))
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

from clean.maven.maven_clean import main as maven_clean
from clean.maven.maven_index import main as maven_index
from clean.utils.clean_utils import save_to_s3
from shared.type import NLPType, LanguageType
from config import read_config_base_library_predict
from loguru import logger

@logger.catch
def main():
    """
    main clean data script
    """
    cleaning_type: NLPType = NLPType.base_library

    maven_clean(cleaning_type, LanguageType.java)
    save_to_s3(cleaning_type)

    maven_index(cleaning_type, LanguageType.java)

if __name__ == '__main__':
    read_config_base_library_predict()
    main()
