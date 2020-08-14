#!/bin/bash

# abort on errors
set -e

cd ../..

image="ubuntu-latest=nektos/act-environments-ubuntu:18.04"
workflow=./.github/workflows/nlp-training.yml
secrets=./.github/workflows/secrets/.nlp-training.env

act -W $workflow --secret-file $secrets -P $image

cd -
