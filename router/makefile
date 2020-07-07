install:
	go get

run:
	go run src/main.go

format:
	gofmt -w src

lint:
	find src/ -type d | xargs -L 1 golint

test:
	go test -race -coverprofile=coverage.txt -covermode=atomic ./src/...

build:
	go build -o main ./src/
