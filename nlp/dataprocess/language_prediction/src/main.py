from loguru import logger
from .config import read_config_language_prediction as read_config
from load.load_language_prediction import main as load_data
from clean.clean_language_prediction import main as clean_data


@logger.catch
def main() -> None:
    read_config()
    load_data()
    clean_data()


if __name__ == "main":
    main()
