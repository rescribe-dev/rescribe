#!/bin/bash

# abort on errors
set -e

cd ../antlr
sudo apt-get update -y
sudo apt-get install -y antlr4
./predeploy.sh
cd -
