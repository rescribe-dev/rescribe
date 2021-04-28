# language_prediction

## How to use

```bash
$ conda activate rescribe-nlp-dataprocess
$ python main.py
```

This will fetch the number of data-rows as specified in `nlp/dataprocess/utils/variables.py` >> `dataset_length` and store them in the appropriate cleaned-format for training.

For details on implementation, see [load](load/README.md), [clean](clean/README.md).
