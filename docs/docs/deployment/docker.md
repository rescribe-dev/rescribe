---
id: docker
title: Docker
sidebar_label: Docker
---

Here are some commands for working with docker:

- `cd api`
- `sudo docker images`
- `sudo docker image rm -f api`
- `sudo docker build -t api .`
- `sudo docker run -p 8080:8080 --env-file .env -d api`
- `sudo docker ps`
- `sudo docker logs <container id>`
- for logging into docker, use this command (from [here](https://stackoverflow.com/a/61854312/8623391)): `sudo docker login -u AWS -p $(aws ecr get-login-password --region us-east-1) <account-id>.dkr.ecr.us-east-1.amazonaws.com`
- to delete all docker files: `sudo docker rmi -f $(sudo docker images -a -q)`
