package handlers

import (
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateBoard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req model.CreateBoard

		if err := ctx.ShouldBindJSON(&req); err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "Failed request")
			return
		}

		var members []model.User
		for _, id := range req.MembersID {
			parsedID, err := uuid.Parse(id)
			if err != nil {
				helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "invalid UUID : "+id)
				return
			}

			var user model.User
			if err := database.DB.First(&user, "id = ?", parsedID).Error; err != nil {
				helpers.ResponseJson(ctx, http.StatusNotFound, false, nil, "user is not found : "+id)
				return
			}

			members = append(members, user)
		}

		board := model.Board{
			Name: req.Name,
		}

		// TODO: anjing databaseny ga bener kkampret ga ke save ke boards bangsat tai anjing

		if err := database.DB.Create(&board).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to create board")
			return
		}

		if err := database.DB.Model(&board).Association("Members").Append(members); err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to association : "+err.Error())
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, board, "Success create new board")
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

func GetBoards() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id := ctx.Param("id")

		parsedID, err := uuid.Parse(id)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "bad ID")
			return
		}

		var board model.Board
		if err := database.DB.Preload("Members").Preload("Columns").First(&board, "id = ?", parsedID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusNotFound, false, nil, "board not found")
			return
		}

		data := model.ResponseBoards{
			ID:      parsedID,
			Name:    board.Name,
			Members: board.Members,
			Columns: board.Columns,
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, data, "success get boards")
	}
}
