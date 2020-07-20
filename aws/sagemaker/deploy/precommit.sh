#!/bin/bash

set -e

cd ../../../scripts

./precommit_python.sh aws/sagemaker/deploy

cd -
