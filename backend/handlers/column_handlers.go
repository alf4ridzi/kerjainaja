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

		var column model.Column
		if err := database.DB.Preload("Cards").First(&column, "id = ?", colum.ID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "column is not found")
			return
		}

		jsonBytes, err := helpers.CreateJsonBytes(column)
		if err != nil {
			panic(err)
		}

		BroadcastEventWithType("column_update", string(jsonBytes))

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
		if err := database.DB.Preload("Cards").Preload("Cards.Members").First(&col, "id = ?", parsedID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column is not found")
			return
		}

		col.Name = req.Name

		if err := database.DB.Save(&col).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to update : "+err.Error())
			return
		}

		jsonBytes, err := helpers.CreateJsonBytes(col)
		if err != nil {
			panic(err)
		}

		BroadcastEventWithType("column_update", string(jsonBytes))

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "success update")
	}
}

func DeleteColumn() gin.HandlerFunc {
	return func(ctx *gin.Context) {
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

		columnid, err := uuid.Parse(ctx.Param("id"))
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column id is not valid")
			return
		}

		var column model.Column
		if err := database.DB.First(&column, "id = ?", columnid).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column is not found!")
			return
		}

		// delete all cards
		var cards []model.Card
		if err := database.DB.Model(&column).Association("Cards").Find(&cards); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "failed get cards")
			return
		}

		for _, card := range cards {
			if err := database.DB.Model(&card).Association("Members").Clear(); err != nil {
				helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "failed to delete members card")
				return
			}

			if err := database.DB.Unscoped().Delete(&card).Error; err != nil {
				helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to delete cards")
				return
			}
		}

		if err := database.DB.Delete(&column, "id = ?", columnid).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "error delete column")
			return
		}

		var board model.Board
		if err := database.DB.Preload("Members").Preload("Columns").Preload("Columns.Cards").Preload("Columns.Cards.Members").First(&board, "id = ?", column.BoardID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "board is not found")
			return
		}

		jsonBytes, err := helpers.CreateJsonBytes(board)
		if err != nil {
			panic(err)
		}

		BroadcastEventWithType("board_update", string(jsonBytes))

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "success delete a column")

	}
}
