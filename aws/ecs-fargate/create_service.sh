#!/bin/bash

set -e

aws ecs create-service --cluster fargate --cli-input-json file://rescribe-api-service.json
