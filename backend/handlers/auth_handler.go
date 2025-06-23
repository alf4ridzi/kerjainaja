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
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "Failed read request")
			return
		}

		tokenHeader := ctx.Request.Header.Get("Authorization")

		if tokenHeader != "" {
			tokenHeader = tokenHeader[len("Bearer "):]
			_, err := helpers.ParseAndValidateToken(tokenHeader)
			if err == nil {
				helpers.ResponseJson(ctx, http.StatusOK, true, nil, "sudah login")
				return
			}
		}

		var user model.User
		if err := database.DB.Where("email = ?", u.Email).First(&user).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusNotAcceptable, false, nil, "email / password salah")
			return
		}

		// hashed := crypto.HashPassword(u.Password)

		if err := crypto.ValidatePassword(user.Password, u.Password); err != nil {
			helpers.ResponseJson(ctx, http.StatusNotAcceptable, false, nil, "email / password salah")
			return
		}

		tokenJwt, err := helpers.CreateTokenSession(user.ID, user.Username, user.Role, time.Now().Add(24*time.Hour))
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "Gagal membuat token jwt : "+err.Error())
			return
		}

		data := map[string]string{
			"token": tokenJwt,
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, data, "Sukses login!")
	}
}

func Register() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var reg model.Register

		if err := ctx.ShouldBindJSON(&reg); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, err.Error())
			return
		}

		var user model.User
		if err := database.DB.Where("email = ? OR username = ?", reg.Email, reg.Username).First(&user).Error; err == nil {
			switch {
			case user.Email == reg.Email:
				helpers.ResponseJson(ctx, http.StatusConflict, false, nil, "email sudah terdaftar")
			case user.Username == reg.Username:
				helpers.ResponseJson(ctx, http.StatusConflict, false, nil, "username sudah terdaftar")
			default:
				helpers.ResponseJson(ctx, http.StatusConflict, false, nil, "email atau username sudah terdaftar")
			}
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
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "internal server error failed create user")
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "Success register")
	}
}
