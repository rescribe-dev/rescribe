#!/bin/bash

set -e

cd ../../scripts

./precommit_python.sh nlp/training

cd -
