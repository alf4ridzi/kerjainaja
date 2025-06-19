package handlers

import (
	"kerjainaja/database"
	"kerjainaja/helpers"
	"kerjainaja/model"
	"net/http"
	"slices"

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

		tokenHeader := ctx.Request.Header.Get("Authorization")
		if tokenHeader == "" {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, "access denied")
			return
		}

		token := tokenHeader[len("Bearer "):]

		claims, err := helpers.ParseAndValidateToken(token)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, err.Error())
			return
		}

		userID := claims["sub"]

		var user model.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusUnauthorized, false, nil, "user is not found")
			return
		}

		board := model.Board{
			Name: req.Name,
		}

		if err := database.DB.Create(&board).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to create board")
			return
		}

		if err := database.DB.Model(&board).Association("Members").Append(&user); err != nil {
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

		id := ctx.Param("id")

		parsedID, err := uuid.Parse(id)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "bad ID")
			return
		}

		var board model.Board
		if err := database.DB.
			Preload("Members").
			Preload("Columns.Cards").
			Preload("Columns.Cards.Members").
			First(&board, "id = ?", parsedID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusNotFound, false, nil, "board not found")
			return
		}

		if !slices.ContainsFunc(board.Members, func(m model.User) bool {
			return m.ID == user.ID
		}) {
			if err := database.DB.Model(&board).Association("Members").Append(&user); err != nil {
				helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to append user")
				return
			}
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

func LeaveBoard() gin.HandlerFunc {
	return func(ctx *gin.Context) {

		tokenHeader := ctx.Request.Header.Get("Authorization")
		if tokenHeader == "" {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "token is empty")
			return
		}

		id, err := uuid.Parse(ctx.Param("id"))
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "id is not valid")
			return
		}

		token := tokenHeader[len("Bearer "):]

		claims, err := helpers.ParseAndValidateToken(token)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "token is not valid")
			return
		}

		userIDclaims := claims["sub"].(string)

		userID, err := uuid.Parse(userIDclaims)
		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "userid is not valid")
			return
		}

		var user model.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "user is not found")
			return
		}

		var board model.Board
		if err := database.DB.Preload("Members").First(&board, "id = ?", id).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "board is not found")
			return
		}

		isJoined := false
		for _, m := range board.Members {
			if user.ID == m.ID {
				isJoined = true
			}
		}

		if !isJoined {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "member is not join yet")
			return
		}

		if err := database.DB.Model(&board).Association("Members").Delete(&user); err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, err.Error())
			return
		}

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "leave board")
	}
}
