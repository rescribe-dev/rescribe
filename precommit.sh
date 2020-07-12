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

node_paths=("api/" "github-app/" "cli/" "web/" "prerender/" "vscode/" "aws/cloudfront/build-frontend/" "docs/" "status/" "emails/" \
            "aws/cloudfront/frontend/origin-request/" "aws/cloudfront/frontend/viewer-response/" \
            "aws/cloudfront/docs/origin-request/" "aws/cloudfront/docs/viewer-response/" \
            "aws/lambda/update-cloudfront-lambda")

for path in "${node_paths[@]}"
do
  if [ "$1" = "$force_run_command" ] || check_changes "$path" ; then
    npm run precommit --prefix $path
  fi
done

script_paths=("antlr/" "fast/" "nlp/dataload" "nlp/deployment" "nlp/training" "aws/sagemaker/deploy")

for path in "${script_paths[@]}"
do
  if [ "$1" = "$force_run_command" ] || check_changes "$path" ; then
    cd "$path"
    ./precommit.sh
    cd -
  fi
done

git secrets --scan

git add -A
