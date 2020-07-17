#!/bin/bash

# abort on errors
set -e

temp_dir=./temp

rm -rf "$temp_dir"

git clone https://github.com/awslabs/git-secrets.git "$temp_dir"
cd "$temp_dir"
sudo make install
cd -

rm -rf "$temp_dir"

git secrets --register-aws
