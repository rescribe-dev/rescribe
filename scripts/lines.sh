#!/bin/bash

# from here: https://gist.github.com/amitchhajer/4461043
# for reference: https://www.quora.com/How-many-lines-of-code-is-Google-Chrome
#                https://www.quora.com/How-many-lines-of-code-are-in-the-Linux-kernel

# abort on errors
set -e

cd ..

# make sure cloc is installed with sudo apt-get install -y cloc
cloc $(git ls-files)

git ls-files | \
while read f; do \
    git blame -w -M -C -C --line-porcelain "$f" | \
   grep -I '^author-mail '; \
done | cut -f2 -d'<' | cut -f1 -d'>' | sort -f | uniq -ic | sort -n

cd - &>/dev/null
