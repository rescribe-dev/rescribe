file=test.py

curl localhost:8080/graphql \
  -F operations='{ "query": "mutation ($files: [Upload!]!) { indexFiles(files: $files, paths: [\"asdf123\"], repository: \"asdf\", branch: \"asdf\") }", "variables": { "files": [null] } }' \
  -F map='{ "0": ["variables.files"] }' \
  -F 0=@$file
