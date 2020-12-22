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
from clean.github.github_clean import main as dataclean
from shared.file_extensions import FileExtensions
from shared.type import NLPType


async def main():
    """
    main clean data script
    """
    await dataclean(NLPType.library_relation, [FileExtensions.java])


if __name__ == '__main__':
    loop = get_event_loop()
    loop.run_until_complete(main())