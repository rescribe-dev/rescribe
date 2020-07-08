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

node_paths=("api/" "github-app/" "cli/" "web/" "prerender/" "vscode/" ".github/build-frontend/" "docs/" "status/" "emails/" \
            "aws/cloudfront/edge-lambda-origin-request/" "aws/cloudfront/edge-lambda-viewer-response/" \
            ".github/update-cloudfront-lambda")

for path in "${node_paths[@]}"
do
  if [ "$1" = "$force_run_command" ] || check_changes "$path" ; then
    npm run precommit --prefix $path
  fi
done

script_paths=("antlr/" "nlp/" "router/")

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
