#!/bin/bash

# abort on errors
set -e

if [ -z "$CONDA_DEFAULT_ENV" ]; then
  source $(conda info --base)/etc/profile.d/conda.sh
fi

conda activate rescribe-nlp-deployment

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

echo 'done with nlp deployment precommit'

conda deactivate
