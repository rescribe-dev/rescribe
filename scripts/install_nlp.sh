#!/bin/bash

# abort on errors
set -e

cd ../nlp
conda env create --file ../nlp/environment.yml
cd -
