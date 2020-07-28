---
id: aws
title: AWS
sidebar_label: AWS
---

The AWS deployment is configured through the Github Actions CI/CD framework. In the `.github` folder of the source repository, there are `yaml` files in the `workflows/` directory. These files specify the deployment and testing jobs that run when a commit is pushed to the main branch, and files were changed in a given directory. When changes are made in the `web/` directory, for example, the "Frontend" action runs, specified in the `frontend.yml` workflow file. This workflow builds the website static files, and saves them to an S3 bucket. Then in AWS, a cloudfront instance serves those files to users around the world, caching the files that are needed frequently.
