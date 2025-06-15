package handlers

import (
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateNewCard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req model.NewCard
		if err := ctx.ShouldBindJSON(&req); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "bad request")
			return
		}

		tokenHeader := ctx.Request.Header.Get("Authorization")
		if tokenHeader == "" {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, "token is empty")
			return
		}

		token := tokenHeader[len("Bearer "):]

		claims, err := helpers.ParseAndValidateToken(token)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, err.Error())
			return
		}

		userID := claims["sub"]

		var user model.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "user is not found")
			return
		}

		parsedColumnID, err := uuid.Parse(req.ColumnID)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "id is not valid")
			return
		}

		var column model.Column
		if err := database.DB.First(&column, "id = ?", parsedColumnID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column is not found")
			return
		}

		newCard := model.Card{
			Title:       req.Title,
			Description: req.Description,
			ColumnID:    column.ID,
			Members:     []model.User{user},
		}

		if err := database.DB.Create(&newCard).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "unable to make a damn card")
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "success create new card")
	}
}
