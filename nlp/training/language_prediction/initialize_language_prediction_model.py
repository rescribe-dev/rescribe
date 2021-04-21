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

import tensorflow as tf
from tensorflow.keras import layers

from transformers.modeling_albert import AlbertPreTrainedModel
from transformers import AlbertTokenizer, AlbertConfig, TFAlbertModel

from utils.types import reScribeModel
from utils.variables import albert


class AlbertTokenizationLayer(tf.keras.layers.Layer):
    def __init__(self, tokenizer):
        super(AlbertTokenizationLayer, self).__init__()
        self.tokenizer = tokenizer
    
    def build(self, input_shape):
        super(AlbertTokenizationLayer, self).build(input_shape)
    
    def call(self, sentences):

        output_list = []
        for sentence in sentences:
            inputs = self.tokenizer.encode_plus(str(sentence), 
                    add_special_tokens=True, 
                    max_length=64, 
                    padding='max_length',
                    return_attention_mask=True, 
                    return_token_type_ids=True,
                    truncation=True)
        
            output_list.append(tf.convert_to_tensor([inputs['input_ids'], inputs['attention_mask'], inputs['token_type_ids']], dtype=tf.int32))
        
        return tf.stack(output_list)
        
        
        
        
class LanguagePredictionModel(reScribeModel):
    def __init__(self, learning_rate: float, batch_size: float): 
        super(LanguagePredictionModel, self).__init__()
        
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        
        self.tokenizer = AlbertTokenizer.from_pretrained(
            albert, do_lower_case=True, add_special_tokens=True, max_length=64, pad_to_max_length=True)


        self.tokenization_layer = AlbertTokenizationLayer(self.tokenizer)
        
        
        self.pretrained_base = self._load_pretrained_base()
        self.top_layers = self._load_top_layers()
        
        
    def call(self, query: str):
        x = self.tokenization_layer(query)
        x = self.pretrained_base(x)
        return self.top_layers(x)

    def _load_input_processor(self):
        return layers.Reshape((-1, 1))
    
    def _load_pretrained_base(self):
        inp = layers.Input((3, 64))
        x = layers.Dense(100)(inp)
        x = layers.Dense(200)(x)
        x = layers.Dense(10)(x)
        x = layers.LeakyReLU()(x)
        # return x
        return tf.keras.models.Model(inputs=inp, outputs=x)
        
    def _load_top_layers(self):
        return layers.Dense(5, activation='softmax')
        
    
    
def main():
    # batch_size = 64
    
    # output_list = []
    # for i in range(batch_size):
    #     print(tf.concat([tf.ones([1, 64]), tf.ones([1, 64]), tf.ones([1, 64])], axis=0))
    #     output_list.append(tf.concat([tf.ones([1, 64]), tf.ones([1, 64]), tf.ones([1, 64])], axis=0))
    # print(tf.stack(output_list))
    model = LanguagePredictionModel(1e-4, 64)
    model.compile(optimizer='rmsprop')
    # model.build(input_shape=(3,64))
    print(model(tf.convert_to_tensor(["helo there"])))
    model.summary()
    print(model.layers)
    print(layers.Dense(10)(tf.zeros([10, 1])))
    print(
        
        AlbertTokenizationLayer(AlbertTokenizer.from_pretrained(
            albert, do_lower_case=True, add_special_tokens=True, max_length=64, pad_to_max_length=True))("hello how are you")[0])
    # model.print_summary()
    
if __name__ == '__main__':
    main()

        
        