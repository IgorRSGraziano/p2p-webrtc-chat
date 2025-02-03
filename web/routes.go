package web

import (
	"chat/web/handlers/ws"

	"github.com/gin-gonic/gin"
)

func setupRoutes(r *gin.Engine) {
	r.LoadHTMLFiles("web/static/index.html")
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", gin.H{})
	})

	r.GET("/ws", ws.Handle)
}
