package server

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/rescribe-dev/rescribe/src/utils"
	"github.com/valyala/fasthttp"
)

func requestHandler(ctx *fasthttp.RequestCtx) {
	method := string(ctx.Method())
	if method == http.MethodGet {
		switch string(ctx.Path()) {
		case "/hello":
			ctx.Response.SetBody([]byte("Hello World!"))
			ctx.Response.SetStatusCode(http.StatusOK)
			break
		case "/ping":
			ctx.Response.SetStatusCode(http.StatusOK)
		default:
			break
		}
	}
}

// StartServer start the server
func StartServer() {
	server := &fasthttp.Server{
		Handler: requestHandler,
	}
	port := strconv.Itoa(utils.Port)
	utils.Logger.Info(fmt.Sprintf("server started at http://localhost:%s 🚀", port))
	if err := server.ListenAndServe(":" + port); err != nil {
		utils.Logger.Error(err.Error())
	}
}
