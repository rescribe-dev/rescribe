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
from utils.types import NLPType
from asyncio import get_event_loop
from utils.config import read_config
from utils.clean_utils import save_to_s3
from utils.file_extensions import FileExtensions
from related_library_prediction.clean.github.related_library_prediction_github_clean import main as clean_data


@logger.catch
async def main() -> None:
    read_config()
    await clean_data([FileExtensions.java])
    save_to_s3(NLPType.related_library_prediction)
    
if __name__ == "__main__":
    loop = get_event_loop()
    loop.run_until_complete(main())



