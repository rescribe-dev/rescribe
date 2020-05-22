#!/bin/bash

# abort on errors
set -e

./gen.sh
./precommit.sh
./gradlew build
