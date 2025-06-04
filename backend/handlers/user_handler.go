package handlers

import (
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUsers() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.Request.Header.Get("Authorization")

		if token == "" {
			helpers.ResponseJson(ctx, http.StatusNotAcceptable, false, nil, "token is empty")
			return
		}

		token = token[len("Bearer "):]

		claims, err := helpers.ParseAndValidateToken(token)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusForbidden, false, nil, err.Error())
			return
		}

		userid := claims["sub"]
		username := claims["username"]

		var user model.User
		if err := database.DB.Where("id = ? AND username = ?", userid, username).First(&user).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusForbidden, false, nil, "user tidak di temukan")
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, user, "success get account information")
	}
}
