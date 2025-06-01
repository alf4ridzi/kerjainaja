package handlers

import (
	"kerjainaja/crypto"
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Login() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var u model.Login

		if err := ctx.ShouldBindJSON(&u); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, "error", nil, "Failed read request")
			return
		}

		var user model.User
		if err := database.DB.Where("username = ?", u.Username).First(&user).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusNotAcceptable, "error", nil, "Username / Password salah")
			return
		}

		hashed := crypto.HashPassword(u.Password)

		if err := crypto.ValidatePassword(user.Password, hashed); err != nil {
			helpers.ResponseJson(ctx, http.StatusNotAcceptable, "error", nil, "Username / Password salah")
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, "success", nil, "Sukses login!")
	}
}
