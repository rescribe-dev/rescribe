#!/bin/bash

# exit if errors
set -e

rm -rf static/storybook

cd ../web
yarn build:storybook
cp -R dist-storybook ../docs/static/storybook
cd - &>/dev/null
