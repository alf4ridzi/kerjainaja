package routes

import (
	"kerjainaja/handlers"
	"kerjainaja/helpers"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func MapRoutes(routes *gin.Engine) {
	routes.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	{
		api := routes.Group("/api")
		api.GET("/", func(ctx *gin.Context) {
			helpers.ResponseJson(ctx, 200, true, nil, "api is up!")
		})
		api.POST("/login", handlers.Login())
		api.POST("/register", handlers.Register())
	}
}
