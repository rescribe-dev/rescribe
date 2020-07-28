#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/dataload/search-classifier

cd -
