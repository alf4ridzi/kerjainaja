package main

import (
	"kerjainaja/database"
	"kerjainaja/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()

	r := gin.Default()
	routes.MapRoutes(r)
	r.Run(":8080")
}
