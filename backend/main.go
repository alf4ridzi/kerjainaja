package main

import (
	"kerjainaja/config"
	"kerjainaja/database"
	"kerjainaja/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	appenv := config.Env("APP_ENV")

	if appenv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	database.InitDB()

	r := gin.Default()
	routes.MapRoutes(r)
	r.Run(":8080")
}
