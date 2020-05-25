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
