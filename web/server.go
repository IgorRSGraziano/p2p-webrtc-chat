package web

import (
	"github.com/gin-gonic/gin"
)

func StartServer() {
	r := gin.Default()

	setupRoutes(r)

	r.Run()
}
