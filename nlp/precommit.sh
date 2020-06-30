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
mypy src --ignore-missing-imports

# save current environment to file
conda env export --no-builds | grep -v "^prefix: " > environment.yml

# alternative:
# conda list -e | sed -E "s/^(.*\=.*)(\=.*)/\1/" > requirements.txt

echo 'done with nlp precommit'

conda deactivate
