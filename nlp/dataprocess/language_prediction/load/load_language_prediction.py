#!/usr/bin/env python
"""
load data into post questions
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
from language_prediction.load.stackoverflow.language_prediction_stackoverflow_load import main as load_data


@logger.catch
def main() -> None:
    logger.info("Made it to here")
    load_data()


if __name__ == "__main__":
    main()
