#!/bin/bash

# exit if errors
set -e

rm -rf static/storybook

cd ../web

# run gatsby build to prevent errors with babel config
yarn run prebuild
yarn run gatsby:build || true

# build storybook
yarn run build:storybook
# copy to docs
cp -R dist-storybook ../docs/static/storybook

cd - &>/dev/null
