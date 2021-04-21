#!/usr/bin/env python
"""
main file

entry point for running nlp training module
"""

import argparse
from shared.config import read_config
from shared.type import NLPType, ModelMode
from train import main as training_main
from loguru import logger


@logger.catch
def main() -> None:
    """
    main entry point
    """
    read_config()

    parser = argparse.ArgumentParser()

    parser.add_argument('--learning-rate', type=int, default=1)
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--communicator', type=str)
    parser.add_argument('--frequency', type=int, default=20)

    # dataload type
    parser.add_argument('--type', type=str,
                        choices=[NLPType.language.name])

    # optional arguments
    args = parser.parse_args()

    if args.type is None:
        raise ValueError(
            f'No type argument provided for training\nValid choices are: --type="language"')

    training_main(NLPType(args.type), ModelMode.initial_training)


if __name__ == '__main__':
    main()
