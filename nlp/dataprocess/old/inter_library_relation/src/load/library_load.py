#!/usr/bin/env python
"""
load data into post questions
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

from load.github.github_load import main as dataload_github
from shared.type import NLPType
from loguru import logger


@logger.catch
def main():
    """
    main function for dataload
    """

    dataload_github(NLPType.library_relation)


if __name__ == '__main__':
    main()
