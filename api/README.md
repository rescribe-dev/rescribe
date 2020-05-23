# api

## To Build:
1. Download the correct .env file from [the drive](https://drive.google.com/drive/folders/1ZZhFu96jvGxrcdbPJ8U6hYke1cI3M-1b) and it is named correctly (.env)
2. `yarn install`
3. `yarn build`
## To Run: 
1. `yarn start`
2. [Open the graphql page](http://localhost:8080/graphql)
    - Example query:
        ```
        query hello {
            hello
        }
        ```
        - Should return 
            ```
            {
                "data": {
                    "hello": "Hello world! 🚀"
                }
            }
            ```
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
