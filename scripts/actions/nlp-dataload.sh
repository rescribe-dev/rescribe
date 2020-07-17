#!/bin/bash

# install: https://github.com/nektos/act#installation
# for arch: yay -Syu act-git

# abort on errors
set -e

cd ../..

image="ubuntu-latest=nektos/act-environments-ubuntu:18.04"
workflow="./.github/workflows/nlp-dataload.yml"
secrets=./.github/workflows/secrets/.nlp-dataload.env

sudo act -W $workflow --secret-file $secrets -P $image

cd -
