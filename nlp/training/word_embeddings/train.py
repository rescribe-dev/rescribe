# Taken from https://www.geeksforgeeks.org/python-word-embedding-using-word2vec/
# and modified
# Python program to generate word vectors using Word2Vec

# importing all necessary modules
import gensim
from gensim.models import Word2Vec
from glob import glob
# Reads ‘alice.txt’ file
files = glob("../../data/clean_data/library_analysis/*.csv")
data = []
for file in files:
    f = open(file)
    lines = f.readlines()
    f.close()
    for l in lines:
        data.append(l.split(" "))

# Create CBOW model
model1 = gensim.models.Word2Vec(data, min_count=1, size=100, window=5)

# Print results
java_lib_list = 'java.util.List'
java_lib_arrlist = 'java.util.ArrayList'
java_lib_jframe = "javax.swing.JFrame"
print("Cosine similarity between {java_lib_list} " +
      "and {java_lib_arrlist} - CBOW : ",
      model1.similarity(java_lib_list, java_lib_arrlist))

print("Cosine similarity between {java_lib_jframe} " +
      "and {java_lib_jframe} - CBOW : ",
      model1.similarity(java_lib_list, java_lib_jframe))

# Create Skip Gram model
# model2 = gensim.models.Word2Vec(data, min_count = 1, size = 100,
#                                             window = 5, sg = 1)

# # Print results
# print("Cosine similarity between {java_lib_list} " +
#         "and 'wonderland' - Skip Gram : ",
#     model2.similarity('alice', 'wonderland'))

# print("Cosine similarity between 'alice' " +
#             "and 'machines' - Skip Gram : ",
#     model2.similarity('alice', 'machines'))
