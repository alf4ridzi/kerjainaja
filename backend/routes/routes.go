package routes

import (
	"kerjainaja/handlers"
	"kerjainaja/helpers"

	"github.com/gin-gonic/gin"
)

func MapRoutes(routes *gin.Engine) {
	{
		api := routes.Group("/api")
		api.GET("/", func(ctx *gin.Context) {
			helpers.ResponseJson(ctx, 200, "success", nil, "api is up!")
		})
		api.POST("/login", handlers.Login())
	}
}
