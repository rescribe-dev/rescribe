#!/bin/bash

# abort on errors
set -e

./gen.sh
./gradlew build
