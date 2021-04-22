#################################
# for handling relative imports #
#################################
if __name__ == "__main__":
    import sys
    from pathlib import Path

    current_file = Path(__file__).resolve()
    root = next(
        elem for elem in current_file.parents if str(elem).endswith("training")
    )
    sys.path.append(str(root))
    # remove the current file's directory from sys.path
    try:
        sys.path.remove(str(current_file.parent))
    except ValueError:  # Already removed
        pass
#################################

import numpy as np
import tensorflow as tf

from typing import List
from utils.variables import albert
from tensorflow.keras import layers
from utils.types import reScribeModel
from transformers.modeling_albert import AlbertPreTrainedModel
from transformers import AlbertTokenizer, AlbertConfig, TFAlbertModel

 
class LanguagePredictionModel(reScribeModel):
    def __init__(self, max_sequence_length: int = 64, classes: List[str] = None): 
        super(LanguagePredictionModel, self).__init__()
        
        assert classes is not None
        self.classes = classes
        num_labels = len(classes)

        self.tokenizer = AlbertTokenizer.from_pretrained(
            albert, do_lower_case=True, add_special_tokens=True, max_length=64, pad_to_max_length=True)

        albert_config = self._load_albert_config(num_labels)
        transformer_model = TFAlbertModel.from_pretrained(
            albert, config=albert_config)
        input_ids = layers.Input(
            shape=(max_sequence_length,), name='input_ids', dtype='int32')
        input_masks = layers.Input(
            shape=(max_sequence_length,), name='input_masks_ids', dtype='int32')
        input_segments = layers.Input(
            shape=(max_sequence_length,), name='input_segments', dtype='int32')
        
        embedding_layer = transformer_model.albert(
            input_ids, attention_mask=input_masks, token_type_ids=input_segments)[0]
            
        X = layers.Bidirectional(layers.LSTM(
            50, return_sequences=True, dropout=0.1, recurrent_dropout=0.1))(embedding_layer)
        X = layers.GlobalMaxPool1D()(X)  # Dimension Reduction
        X = layers.Dense(50, activation='relu')(X)
        X = layers.Dropout(0.2)(X)
        X = layers.Dense(num_labels, activation='softmax')(X) #maybe needs to be num labels -1
        
        self.model = tf.keras.Model(inputs=[input_ids, input_masks, input_segments], outputs=X)
        for layer in self.model.layers[:4]:
            layer.trainable = False
        
    def call(self, inputs):
        return self.model(inputs)
    
    def summary(self):
        self.model.summary()
        
    def load_weights(self, checkpoint_path):
        self.model.load_weights(checkpoint_path)
        
    def _load_albert_config(self, num_labels):
        albert_base_config = AlbertConfig(hidden_size=768, 
                                            num_attention_heads=12, 
                                            intermediate_size=3072, 
                                            num_labels=num_labels
                                )
                            
        model = AlbertPreTrainedModel(albert_base_config)
        config = model.config
        config.output_hidden_states = False
        return config
        
    def tokenize(self, sentences):
        """
        tokenize inputs
        """
        input_ids, input_masks, input_segments = [], [], []
        for sentence in sentences:
            inputs = self.tokenizer.encode_plus(sentence, add_special_tokens=True, max_length=64, padding='max_length',
                                                return_attention_mask=True, return_token_type_ids=True, truncation=True)
            input_ids.append(inputs['input_ids'])
            input_masks.append(inputs['attention_mask'])
            input_segments.append(inputs['token_type_ids'])
            
        return np.asarray(input_ids, dtype='int32'), np.asarray(input_masks, dtype='int32'), np.asarray(input_segments, dtype='int32')
    

def main():
    model = LanguagePredictionModel(64, ['cpp', 'java'])
    model.compile(optimizer='rmsprop')
    print(model(model.tokenize(["hello there"])))
    model.summary()

if __name__ == '__main__':
    main()

        
        