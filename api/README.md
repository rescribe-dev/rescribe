# api

- main api for interacting with rescribe
- docs are not available yet
- elasticsearch is the main search engine used
- authorization: https://typegraphql.com/docs/authorization.html#__docusaurus

## docker

- `sudo docker images`
- `sudo docker image rm -f api`
- `sudo docker build -t api .`
- `sudo docker run -p 8080:8080 --env-file .env -d api`
- `sudo docker ps`
- `sudo docker logs <container id>`
