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
