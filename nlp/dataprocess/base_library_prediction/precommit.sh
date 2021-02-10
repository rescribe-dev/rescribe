#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/dataprocess/base_library_prediction ../environment.yml

cd -
