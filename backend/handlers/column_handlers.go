package handlers

import (
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateColumn() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req model.AddBoard

		if err := ctx.ShouldBindJSON(&req); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "bad request")
			return
		}

		parsedID, err := uuid.Parse(req.BoardID)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "id is not valid")
			return
		}

		var board model.Board
		if err := database.DB.Where("id = ?", parsedID).First(&board).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "board is not found")
			return
		}

		colum := model.Column{
			Name:    req.Name,
			BoardID: parsedID,
		}

		if err := database.DB.Create(&colum).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed create board")
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, colum, "success add column!")
	}
}

func EditColumn() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req model.EditColumnRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "bad request")
			return
		}

		tokenHeader := ctx.Request.Header.Get("Authorization")
		if tokenHeader == "" {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, "token is not found")
			return
		}

		token := tokenHeader[len("Bearer "):]

		claim, err := helpers.ParseAndValidateToken(token)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, err.Error())
			return
		}

		userID := claim["sub"]

		var user model.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "user is not found")
			return
		}

		columnid := ctx.Param("id")
		if columnid == "" {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "id is not found")
			return
		}

		parsedID, err := uuid.Parse(columnid)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "id is not valid")
			return
		}

		var col model.Column
		if err := database.DB.First(&col, "id = ?", parsedID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column is not found")
			return
		}

		col.Name = req.Name

		if err := database.DB.Save(&col).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to update : "+err.Error())
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "success update")
	}
}
