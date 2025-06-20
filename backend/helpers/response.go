package helpers

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
)

func ResponseJson(ctx *gin.Context, statusCode int, status bool, data any, message string) {
	ctx.JSON(statusCode, gin.H{
		"status": status,
		"data":   data,
		"msg":    message,
	})
}

func CreateJsonBytes(data any) ([]byte, error) {
	return json.Marshal(data)
}
