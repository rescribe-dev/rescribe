#!/bin/bash

set -e

cd ../../../scripts

./precommit_python.sh nlp/dataload/search-classifier

cd -
