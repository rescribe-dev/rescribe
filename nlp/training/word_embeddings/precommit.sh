#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/training/bert

cd -
