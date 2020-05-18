#!/bin/sh

# see https://aws.amazon.com/blogs/compute/securing-credentials-using-aws-secrets-manager-with-aws-fargate/

REGION=us-east-1

# login to aws
aws configure

aws iam create-role --region $REGION --role-name rescribe-task-role --assume-role-policy-document file://rescribe-ecs-task-role-trust-policy.json
aws iam create-role --region $REGION --role-name rescribe-task-execution-role --assume-role-policy-document file://rescribe-ecs-task-role-trust-policy.json
aws iam put-role-policy --region $REGION --role-name rescribe-task-role --policy-name rescribe-iam-policy-task-role --policy-document file://rescribe-iam-policy-task-role.json
aws iam put-role-policy --region $REGION --role-name rescribe-task-execution-role --policy-name rescribe-iam-policy-task-execution-role --policy-document file://rescribe-iam-policy-task-execution-role.json
