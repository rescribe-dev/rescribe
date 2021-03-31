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
from language_prediction.config import read_config_language_prediction as read_config
from language_prediction.load.load_language_prediction import main as load_data
from language_prediction.clean.clean_language_prediction import main as clean_data

@logger.catch
def main() -> None:
    read_config()
    load_data()
    clean_data()


if __name__ == "__main__":
    main()
