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

from asyncio import get_event_loop
from clean.stackoverflow.stackoverflow_clean import main as dataclean
from clean.github.github_clean import main as clean
from shared.file_extensions import FileExtensions
async def main():
    """
    main clean data script
    """
    # dataclean()
    await clean([FileExtensions.java, FileExtensions.cpp])


if __name__ == '__main__':
    loop  = get_event_loop()
    loop.run_until_complete(main())
