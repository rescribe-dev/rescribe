#!/bin/bash

set -e

cd ../../../scripts

./build_zip_lambda.sh aws/cloudfront/docs/origin-request

cd -
