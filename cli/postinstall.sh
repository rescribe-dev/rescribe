#!/bin/bash

set -e

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ "$SKIP_POSTINSTALL" == "true" ]; then
  echo "skipping postinstall";
  exit 0;
else
  echo "running postinstall"
fi

cp .rescriberc.default.yml pub/.rescriberc.yml
cd pub
./postinstall.sh
cd -
