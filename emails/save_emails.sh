#!/bin/bash

# syncs generated email templates with aws s3 data
# need to be logged in to aws cli to use this script

set -e

target="s3://rescribe-email-templates/templates"
yarn run compile-emails
aws s3 sync dist "$target"
