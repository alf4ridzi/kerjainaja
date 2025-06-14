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

		helpers.ResponseJson(ctx, http.StatusOK, true, colum, "success create board")
	}
}
