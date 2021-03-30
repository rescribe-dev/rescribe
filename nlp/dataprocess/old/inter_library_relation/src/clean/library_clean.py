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

from asyncio import get_event_loop
from clean.github.github_clean import main as github_clean
from clean.utils.clean_utils import save_to_s3
from shared.config import read_config
from shared.file_extensions import FileExtensions
from shared.type import NLPType
from loguru import logger


@logger.catch
async def main():
    """
    main clean data script
    """
    cleaning_type: NLPType = NLPType.library_relation
    await github_clean(cleaning_type, [FileExtensions.java])
    save_to_s3(cleaning_type)

if __name__ == '__main__':
    read_config()
    loop = get_event_loop()
    loop.run_until_complete(main())
