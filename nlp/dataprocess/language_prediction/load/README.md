# Language Prediction: Load

## Sources

We load our data from the BigQuery Dataset available [here](https://console.cloud.google.com/marketplace/product/stack-exchange/stack-overflow)

### Sources to investigate

[Stack Exchange Data Dump](https://archive.org/details/stackexchange)

- Last updated 2021-03-01, as checked on 2021-03-31
- Contains an anonymized dump of all user-contributed content on the entire Stack Exchange Network (only interested in Stack Overflow)

[Stack Exchange Data Explorer](https://data.stackexchange.com/)

- Supposedly easier to look at, but supposedly has a data limit?
- Has an [odata](https://www.odata.org/) endpoint

## Querying

We use BigQuery to query the dataset via the BigQueryHelper. All Queries are done in SQL. The query is hardcoded into the applicable load file and its outputs are dumped into a Pandas DataFrame.
