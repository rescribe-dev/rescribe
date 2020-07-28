#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/dataload/file-content-classifier

cd -
