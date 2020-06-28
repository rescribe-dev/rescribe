#!/bin/bash

# abort on errors
set -e

source $(conda info --base)/etc/profile.d/conda.sh

conda activate rescribe-nlp

# format files
autopep8 --exclude='./envs' --in-place --recursive .

# lint files
pylint src

# check types
mypy src

# save current environment to file
conda env export > environment.yml

echo 'done with nlp precommit'

conda deactivate
