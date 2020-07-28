#!/bin/bash

# abort on errors
set -e

cd "../../$1"

source $(conda info --base)/etc/profile.d/conda.sh

env_name=$(grep 'name:' environment.yml | cut -d ' ' -f 2)
conda activate $env_name

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

echo "done with precommit for $env_name"

conda deactivate

cd -
