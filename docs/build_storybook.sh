#!/bin/bash

# exit if errors
set -e

rm -rf static/storybook

cd ../web
# run gatsby build to prevent errors with babel config
yarn run gatsby:build || true
yarn run build:storybook
cp -R dist-storybook ../docs/static/storybook
cd - &>/dev/null
