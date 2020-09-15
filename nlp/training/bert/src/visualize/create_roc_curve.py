#!/usr/bin/env python3
"""
    Create roc visualization
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

import numpy as np
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as pt


# pylint: disable=too-many-statements

def create_roc_curve(model, X_test, y_test, path1: str, path2: str) -> None:
    """
    create output roc curve from training
    """

    x1_input_ids, x1_attention_masks, x1_token_type_ids = [], [], []
    x2_input_ids, x2_attention_masks, x2_token_type_ids = [], [], []
    x3_input_ids, x3_attention_masks, x3_token_type_ids = [], [], []
    y1, y2, y3 = [], [], []

    for index, label in enumerate(y_test):
        if label[0] == 1:
            y1.append(0)
            x1_input_ids.append(X_test[0][index])
            x1_attention_masks.append(X_test[1][index])
            x1_token_type_ids.append(X_test[2][index])

        elif label[1] == 1:
            y2.append(1)
            x2_input_ids.append(X_test[0][index])
            x2_attention_masks.append(X_test[1][index])
            x2_token_type_ids.append(X_test[2][index])

        elif label[2] == 1:
            y3.append(2)
            x3_input_ids.append(X_test[0][index])
            x3_attention_masks.append(X_test[1][index])
            x3_token_type_ids.append(X_test[2][index])

    x1_input_ids = np.asarray(x1_input_ids)
    x1_attention_masks = np.asarray(x1_attention_masks)
    x1_token_type_ids = np.asarray(x1_token_type_ids)

    x2_input_ids = np.asarray(x2_input_ids)
    x2_attention_masks = np.asarray(x2_attention_masks)
    x2_token_type_ids = np.asarray(x2_token_type_ids)

    x3_input_ids = np.asarray(x3_input_ids)
    x3_attention_masks = np.asarray(x3_attention_masks)
    x3_token_type_ids = np.asarray(x3_token_type_ids)

    y1_pred_keras = model.predict(
        [x1_input_ids, x1_attention_masks, x1_token_type_ids]).ravel()
    y2_pred_keras = model.predict(
        [x2_input_ids, x2_attention_masks, x2_token_type_ids]).ravel()
    y3_pred_keras = model.predict(
        [x3_input_ids, x3_attention_masks, x3_token_type_ids]).ravel()

    fpr1_keras, tpr1_keras, _1thresholds_keras = roc_curve(y1, y1_pred_keras)
    fpr2_keras, tpr2_keras, _2thresholds_keras = roc_curve(y2, y2_pred_keras)
    fpr3_keras, tpr3_keras, _3thresholds_keras = roc_curve(y3, y3_pred_keras)

    auc1_keras = auc(fpr1_keras, tpr1_keras)
    auc2_keras = auc(fpr2_keras, tpr2_keras)
    auc3_keras = auc(fpr3_keras, tpr3_keras)

    pt.figure(1)
    pt.plot([0, 1], [0, 1], 'k--')
    pt.plot(fpr1_keras, tpr1_keras,
            label='Keras (label1 area = {:.3f})'.format(auc1_keras))
    pt.plot(fpr2_keras, tpr2_keras,
            label='Keras (label2 area = {:.3f})'.format(auc2_keras))
    pt.plot(fpr3_keras, tpr3_keras,
            label='Keras (label3 area = {:.3f})'.format(auc3_keras))
    pt.xlabel('False positive rate')
    pt.ylabel('True positive rate')
    pt.title('ROC curve')
    pt.legend(loc='best')
    pt.savefig(path1)
    pt.figure(2)
    pt.xlim(0, 0.2)
    pt.ylim(0.8, 1)
    pt.plot([0, 1], [0, 1], 'k--')
    pt.plot(fpr1_keras, tpr1_keras,
            label='Keras (label1 area = {:.3f})'.format(auc1_keras))
    pt.plot(fpr2_keras, tpr2_keras,
            label='Keras (label2 area = {:.3f})'.format(auc2_keras))
    pt.plot(fpr3_keras, tpr3_keras,
            label='Keras (label3 area = {:.3f})'.format(auc3_keras))
    pt.xlabel('False positive rate')
    pt.ylabel('True positive rate')
    pt.title('ROC curve (zoomed in at top left)')
    pt.legend(loc='best')
    pt.savefig(path2)
