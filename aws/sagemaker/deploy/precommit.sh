#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh aws/sagemaker/deploy

cd -
