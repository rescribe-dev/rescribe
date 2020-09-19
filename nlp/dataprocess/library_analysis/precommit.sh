#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/dataprocess/library_analysis

cd -
