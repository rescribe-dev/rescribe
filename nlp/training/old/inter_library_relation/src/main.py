#!/usr/bin/env python
# """
# main file
# entry point for running assignment 1
# """

from loguru import logger
from shared.config import read_config
from shared.GraphModel import GraphModel
from shared.type import NLPType, ModelMode


@logger.catch
def main() -> None:
    """
    main entry point
    """
    read_config()

    model = GraphModel(model_type=NLPType.library_relation, mode=ModelMode.initial_training) # ModelModel.load_pretrained
    from shared.config import PRODUCTION
    if not PRODUCTION:
        logger.info("Starting interactive test loop, you can safely end the program")
        model.run_interactive_test_loop()

if __name__ == "__main__":
    main()
