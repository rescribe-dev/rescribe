from build_model_fully_connected import build_model_fully_connected
import pickle
import tensorflow_hub as hub
import tensorflow as tf
from transformers import BertTokenizer
import bert
from list_files import list_files


def load_model_from_tfhub(bert_path: str):
    bert_layer = hub.KerasLayer(bert_path, trainable=True)
    vocab_file1 = bert_layer.resolved_object.vocab_file.asset_path.numpy()
    bert_tokenizer_tfhub = bert.bert_tokenization.FullTokenizer(
        vocab_file1, do_lower_case=True)
    bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    return bert_layer, bert_tokenizer


def train_model_fullyconnected(bert_layer, bert_inputs, ytr, validation_data, epochs: int, batch_size: int,
                               num_categories: int, max_sequence_length: int, metrics, optimizer: str = 'adam',
                               loss: str = 'binary_crossentropy'):
    model = build_model_fully_connected(bert_layer, num_categories, max_sequence_length)
    model.compile(optimizer=optimizer, loss=loss, metrics=metrics)
    history = model.fit(bert_inputs, ytr, validation_data=validation_data, epochs=epochs, batch_size=batch_size)
    return model, history

def load_input_data(model_inputs_path):
    files = list_files(f"{model_inputs_path}", ".pkl")
    with open(f"{model_inputs_path}/classification_labels.pkl", 'rb') as file:
        classification_labels = pickle.loads(file)

    inputs = []
    for file_name in files:
        try:
            with open(f"{model_inputs_path}/{file_name}", 'r') as file:
                model_inputs = pickle.loads(file)
        except FileNotFoundError:
            print(f"The file does not exist at path: {model_inputs_path}/{file_name}")
        inputs.append(model_inputs)

    bert_inputs, test_inputs, Xtr_bert, Xte_bert, ytr, yte = []

    for model_inputs in inputs:
        bert_inputs.append(model_inputs[0])
        test_inputs.append(model_inputs[1])
        Xtr_bert.append(model_inputs[2])
        Xte_bert.append(model_inputs[3])
        ytr.append(model_inputs[4])
        yte.append(model_inputs[5])

    return bert_inputs, test_inputs, Xtr_bert, Xte_bert, ytr, yte, classification_labels

model_dir: str = "saved_model"
bert_layer, bert_tokenizer = load_model_from_tfhub(
    bert_path="https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/1")
bert_inputs, test_inputs, Xtr_bert, Xte_bert, ytr, yte, classification_labels = load_input_data(".model_inputs")

for i in range(len(bert_inputs)):
    if i != 0:
        model = tf.keras.load_model(f"{model_dir}")
        model.fit(bert_inputs[i], ytr[i], validation_data=(test_inputs[i], yte[i]), epochs=1, batch_size=32)
        model.save(f"{model_dir}/")
        continue
    model, history = train_model_fullyconnected(bert_layer, bert_inputs[i], ytr[i], validation_data=(test_inputs[i], yte[i]),
                                                epochs=1, batch_size=32, num_categories=len(classification_labels),
                                                max_sequence_length=64,
                                                metrics=[tf.keras.metrics.AUC(), tf.keras.metrics.FalsePositives(),
                                                         tf.keras.metrics.Recall(), tf.keras.metrics.Precision(),
                                                         tf.keras.metrics.TruePositives()])
    model.save(f"{model_dir}/")


