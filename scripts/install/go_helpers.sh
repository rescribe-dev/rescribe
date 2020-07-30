#!/bin/bash

# abort on errors
set -e

cd ../..

go get -u golang.org/x/lint/golint

cd -
