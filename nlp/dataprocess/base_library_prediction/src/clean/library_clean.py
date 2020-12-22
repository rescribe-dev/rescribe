#!/usr/bin/env python3
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

from clean.stackoverflow.stackoverflow_clean import main as dataclean
from shared.type import NLPType


def main():
    """
    main clean data script
    """
    dataclean(NLPType.base_library)


if __name__ == '__main__':
    main()
