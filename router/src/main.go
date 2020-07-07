package main

import (
	"github.com/rescribe-dev/rescribe/src/server"
	"github.com/rescribe-dev/rescribe/src/utils"
)

func main() {
	utils.LoadConfig()
	utils.InitializeLogger()
	server.StartServer()
}
