#!/bin/bash

set -e

cd ../../../scripts/precommit

./python.sh nlp/dataprocess/inter_library_relation ../environment.yml

cd -
