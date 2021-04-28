# nlp

> python nlp search service

- https://github.com/aws/sagemaker-training-toolkit

# Research Resources
## Generating Word Embeddings
  - Collaborative Filtering: All similar products bought by multiple customers are embedding into a low dimensional space
  - This low dimensional space will contain similar products close to each other, i.e it's also called nearest neighbor

  - how do we map high dimensional space into a lower dimensions?
  - Principal Component Analysis can be used to create word embeddings ( Tries to find highly correlated dimensions that can be collapsed into a single dimension using Bag Of Words (similar to TF-IDF))
  - Word2vec from Google for training word embeddings. Relies on the distributional hypothesis which states that words which often have the same neighboring words tend to be semantically similar
  - Distributional hypothesis uses continuous bag of words (CBOW) or skip grams
  - https://towardsdatascience.com/word-embeddings-for-nlp-5b72991e01d4





# New Hierarchy and Layout

- data
    - clean_data
        - base_library_prediction
        - related_library_prediction
        - language_prediction
        
    - raw_data
        - base_library_prediction
        - related_library_prediction
        - language_prediction
        
    - models
        - base_library_prediction
        - related_library_prediction
        - language_prediction
    
- dataprocess
    - This is where we handle the downloading and cleaning of all datasets that we may need to use for rescribe
    - utils
        - bigquery
        - *.util.py
        - variables.py
        
    - base_library_prediction
    - Using the predicted language and the information from the user query, predict a single library that is most likely to be used
        - src
        - Store all of the source code for this module, the entire thing should be 'runnable' by a single call to main.py
            - load
            - This will handle all of the downloading of the original raw data, it shall store the raw data as a binary zip
                - load.py
            - clean
                - clean.py
            - main.py
            
    - related_library_prediction
    - Using the predicted language, a single library, and the information in the user query, predict a set of n libraries that are related to the original input library
        - src
        - Store all of the source code for this module, the entire thing should be 'runnable' by a single call to main.py
            - load
            - This will handle all of the downloading of the original raw data, it shall store the raw data as a binary zip
                - load.py
            - clean
                - clean.py
            - main.py
            
    - language_prediction
    - Using the user's query and the information within, predict the language that the user is most likely trying to search for content from
        - src
        - Store all of the source code for this module, the entire thing should be 'runnable' by a single call to main.py
            - load
            - This will handle all of the downloading of the original raw data, it shall store the raw data as a binary zip
                - load.py
                - Using the stackoverflow dataset, this module will download n entries and parse out the query and the language tag assocaited with the question (we will look for lagnguage tags that match a set of n languages)
                - This parsed dataset will then be saved as a binary file
            - clean
                - clean.py
                - will open the zipped file and load the raw data in as batches, each batch will be cleaned and then saved to disk in a binary format 
            - main.py
    
    
- deployment
- training

RIP
```python
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
```