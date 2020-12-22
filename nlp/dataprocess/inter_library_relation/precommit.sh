#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/dataprocess/language

cd -
