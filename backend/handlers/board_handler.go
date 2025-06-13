package handlers

import (
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateBoard() gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func GetBoard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		tokenHeader := ctx.Request.Header.Get("Authorization")
		if tokenHeader == "" {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, "Access Denied")
			return
		}

		token := tokenHeader[len("Bearer "):]
		if token == "" {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, "Access Denied")
			return
		}

		claims, err := helpers.ParseAndValidateToken(token)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, err.Error())
			return
		}

		userID := claims["sub"]

		var user model.User
		if err := database.DB.Preload("Boards").First(&user, "id = ?", userID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusNotFound, false, nil, "user not found")
			return
		}

		data := map[string]any{
			"boards": user.Boards,
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, data, "success get boards")

	}
}
