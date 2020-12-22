#!/bin/bash

set -e

cd ../../../../../scripts

./build_zip_lambda.sh aws/lambda/datasets/libraries/java

cd -
