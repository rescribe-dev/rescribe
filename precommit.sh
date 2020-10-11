#!/bin/bash

# abort on errors
set -e

check_changes() {
  if git diff --stat --cached -- "$1" | grep -E "$1"; then
    echo "run precommit for $1"
    return 0
  else
    echo "no changes found for $1"
    return 1
  fi
}

force_run_command="-f"

node_paths=("api/" "github-app/" "cli/" "web/" "prerender/" "vscode/" "docs/" "status/" "emails/" \
            "aws/cloudfront/frontend/origin-request/" "aws/cloudfront/frontend/viewer-response/" \
            "aws/cloudfront/docs/origin-request/" "aws/cloudfront/docs/viewer-response/" \
            "aws/cloudfront/build-cloudfront/" "aws/lambda/update-cloudfront-lambda/" \
            "aws/cloudfront/frontend/viewer-request/" "aws/lambda/update-sitemap/" \
            "aws/lambda/update-currencies/")

for path in "${node_paths[@]}"
do
  if [ "$1" = "$force_run_command" ] || check_changes "$path" ; then
    npm run precommit --prefix $path
  fi
done

script_paths=("antlr/" "fast/" "nlp/dataprocess/language/" "nlp/dataprocess/library/" \
  "nlp/deployment/" "nlp/training/bert/" "aws/sagemaker/deploy/")

for path in "${script_paths[@]}"
do
  if [ "$1" = "$force_run_command" ] || check_changes "$path" ; then
    cd "$path"
    ./precommit.sh
    cd -
  fi
done

git secrets --scan

# run check for tabs precommit
cd scripts/precommit
./spaces.sh
./line_endings.sh
./check_symlinks.sh
cd -

git add -A
