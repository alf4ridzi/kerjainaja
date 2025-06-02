package handlers

import (
	"kerjainaja/crypto"
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"
	"time"

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

		// hashed := crypto.HashPassword(u.Password)

		if err := crypto.ValidatePassword(user.Password, u.Password); err != nil {
			helpers.ResponseJson(ctx, http.StatusNotAcceptable, "error", nil, "Username / Password salah")
			return
		}

		tokenJwt, err := helpers.CreateTokenSession(user.ID, user.Username, user.Role, time.Now().Add(24*time.Hour))
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, "error", nil, "Gagal membuat token jwt : "+err.Error())
			return
		}

		data := map[string]string{
			"token": tokenJwt,
		}

		helpers.ResponseJson(ctx, http.StatusOK, "success", data, "Sukses login!")
	}
}

func Register() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var reg model.Register

		if err := ctx.ShouldBindJSON(&reg); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, "error", nil, err.Error())
			return
		}

		var user model.User
		if err := database.DB.Where("email = ?", reg.Email).First(&user).Error; err == nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, "error", nil, "email already registered")
			return
		}

		if err := database.DB.Where("username = ?", reg.Username).First(&user).Error; err == nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, "error", nil, "username already registered")
			return
		}

		hashedPassword := crypto.HashPassword(reg.Password)

		newUser := model.User{
			Name:     reg.Name,
			Username: reg.Username,
			Email:    reg.Email,
			Password: hashedPassword,
		}

		if err := database.DB.Create(&newUser).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, "error", nil, "internal server error failed create user")
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, "success", nil, "Success register")
	}
}
