---
id: abstract
title: Abstract
sidebar_label: Abstract
---

reScribe is an NLP-based semantic search engine for code. 'Semantic' search refers to the ability of our search engine to take advantage of the contextual meaning of the source code with respect to the original query. Through leveraging ANTLR4 we are able to parse any source code defined by explicit grammars: Java, C++, Python, etc. A unified API allows multiple client applications — Website, CLI, VSCode Extension, GitHub App — to trigger indexing, run searches, and view results. When a search request is made, it is piped though a Natural Language Processing service, which augments it with a series of filters that match the predicted 'intent' of the query. This enriched request is then sent to ElasticSearch, after which the results are post-processed and forwarded to the client application.
