#!/bin/bash

# from here: https://gist.github.com/amitchhajer/4461043
# for reference: https://www.quora.com/How-many-lines-of-code-is-Google-Chrome
#                https://www.quora.com/How-many-lines-of-code-are-in-the-Linux-kernel

# abort on errors
set -e

cd ../..

# make sure cloc is installed with sudo apt-get install -y cloc
cloc $(git ls-files)

git ls-files | \
while read f; do \
  git blame --line-porcelain "$f" | \
  grep '^author '; \
done | sort -f | uniq -ic | sort -n

cd - &>/dev/null
