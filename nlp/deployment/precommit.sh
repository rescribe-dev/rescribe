#!/bin/bash

set -e

cd ../../scripts/precommit

./python.sh nlp/deployment

cd -
