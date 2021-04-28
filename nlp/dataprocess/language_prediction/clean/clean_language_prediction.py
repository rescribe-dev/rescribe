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
from language_prediction.clean.stackoverflow.language_prediction_stackoverflow_clean import main as clean_data

@logger.catch
def main() -> None:
    clean_data()
    

if __name__ == "__main__":
    main()
    

