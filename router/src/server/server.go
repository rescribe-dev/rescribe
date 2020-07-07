package server

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/mssola/user_agent"
	"github.com/rescribe-dev/rescribe/src/utils"
	"github.com/valyala/fasthttp"
)

var forceRenderQuery = "_render"

var proxyClient = &fasthttp.Client{}

func prepareRequest(req *fasthttp.Request, host string, secure bool) {
	req.Header.Del("Connection")
	req.URI().SetHost(host)
	if secure {
		req.URI().SetScheme("https")
	} else {
		req.URI().SetScheme("http")
	}
}

func postprocessResponse(resp *fasthttp.Response) {
	resp.Header.Del("Connection")
}

func reverseProxyHandler(ctx *fasthttp.RequestCtx, host string, secure bool) {
	req := &ctx.Request
	resp := &ctx.Response
	prepareRequest(req, host, secure)
	if err := proxyClient.Do(req, resp); err != nil {
		utils.Logger.Info(fmt.Sprintf("error when proxying the request: %s", err.Error()))
	}
	postprocessResponse(resp)
}

func requestHandler(ctx *fasthttp.RequestCtx) {
	method := string(ctx.Method())
	if method == http.MethodGet {
		switch string(ctx.Path()) {
		case "/_hello":
			ctx.Response.SetBody([]byte("Hello World!"))
			ctx.Response.SetStatusCode(http.StatusOK)
			break
		case "/_ping":
			ctx.Response.SetStatusCode(http.StatusOK)
		default:
			break
		}
	}
	ua := user_agent.New(string(ctx.UserAgent()))
	prerender := ctx.Request.URI().QueryArgs().Has(forceRenderQuery) || ua.Bot()
	if prerender {
		reverseProxyHandler(ctx, utils.PrerenderHost, utils.PrerenderSecure)
	} else {
		reverseProxyHandler(ctx, utils.DefaultHost, utils.DefaultSecure)
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
