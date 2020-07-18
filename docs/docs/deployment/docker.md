---
id: docker
title: Docker
sidebar_label: Docker
---

Here are some commands for working with docker:

- `cd api`
- `docker images`
- `docker image rm -f api`
- `docker build -t api .`
- `docker run -p 8080:8080 --env-file .env -d api`
- `docker ps`
- `docker logs <container id>`
- for logging into docker, use this command (from [here](https://stackoverflow.com/a/61854312/8623391)): `docker login -u AWS -p $(aws ecr get-login-password --region us-east-1) <account-id>.dkr.ecr.us-east-1.amazonaws.com`
- to delete all docker files: `docker rmi -f $(docker images -a -q)`
