"""
  Train a bert model from scratch
"""
from sys import argv
from loguru import logger

from shared.BertModel import BertModel
from shared.type import NLPType, BertMode


@logger.catch
def main(model_type: NLPType, mode: BertMode, delete_checkpoints: bool = False):
    """
    train a bert model
    """
    if model_type in [NLPType.language, NLPType.base_library]:
        bert_model: BertModel = BertModel(
            model_type, mode, delete_checkpoints=delete_checkpoints)
        logger.success(
            f"Trained bert model, saved checkpoints to: {bert_model.checkpoint_path}")


if __name__ == '__main__':
    if len(argv) < 2:
        raise ValueError('no type provided')
    main(NLPType(argv[1]), BertMode(argv[2]))
