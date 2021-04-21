#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/training/inter_library_analysis ../environment.yml

cd -
