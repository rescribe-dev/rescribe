#!/bin/bash

# abort on errors
set -e

cd ../cli
sudo apt-get update -y
sudo apt-get install -y libkrb5-dev
npm install
cd -
