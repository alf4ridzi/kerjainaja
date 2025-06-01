package helpers

import "github.com/gin-gonic/gin"

func ResponseJson(ctx *gin.Context, statusCode int, status string, data any, message string) {
	ctx.JSON(statusCode, gin.H{
		"status": status,
		"data":   data,
		"msg":    message,
	})
}
