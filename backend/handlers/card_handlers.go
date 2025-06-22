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
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "unable to make a card")
			return
		}

		var card model.Card
		if err := database.DB.Preload("Members").First(&card, "id = ?", newCard.ID).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "card is not found")
			return
		}

		jsonBytes, err := helpers.CreateJsonBytes(card)
		if err != nil {
			panic(err)
		}

		BroadcastEventWithType("card_update", string(jsonBytes))

		helpers.ResponseJson(ctx, http.StatusOK, true, newCard, "success create new card")
	}
}

func DeleteCard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
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

		cardid := ctx.Param("id")

		parsedcardid, err := uuid.Parse(cardid)

		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column id is not valid")
			return
		}

		var card model.Card
		if err := database.DB.Preload("Members").First(&card, "id = ?", parsedcardid).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "card is not found")
			return
		}

		if err := database.DB.Model(&card).Association("Members").Clear(); err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to delete a card")
			return
		}

		if err := database.DB.Delete(&card).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to delete a card")
			return
		}

		jsonBytes, err := helpers.CreateJsonBytes(card)
		if err != nil {
			panic(err)
		}

		BroadcastEventWithType("card_deleted", string(jsonBytes))

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "success delete a card")
	}
}

func JoinCard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
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

		cardid := ctx.Param("id")

		parsedcardid, err := uuid.Parse(cardid)

		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column id is not valid")
			return
		}

		var card model.Card
		if err := database.DB.Preload("Members").First(&card, "id = ?", parsedcardid).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "card is not found")
			return
		}

		for _, m := range card.Members {
			if m.ID == user.ID {
				helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "user already joined")
				return
			}
		}

		if err := database.DB.Model(&card).Association("Members").Append(&user); err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to join")
			return
		}

		if err := database.DB.Preload("Members").First(&card, "id = ?", parsedcardid).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "card is not found")
			return
		}

		jsonBytes, err := helpers.CreateJsonBytes(card)
		if err != nil {
			panic(err)
		}

		BroadcastEventWithType("card_update", string(jsonBytes))

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "success join")

	}
}

func LeaveCard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
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

		cardid := ctx.Param("id")

		parsedcardid, err := uuid.Parse(cardid)

		if err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "column id is not valid")
			return
		}

		var card model.Card
		if err := database.DB.Preload("Members").First(&card, "id = ?", parsedcardid).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "card is not found")
			return
		}

		isJoined := false
		for _, m := range card.Members {
			if m.ID == user.ID {
				isJoined = true
			}
		}

		if !isJoined {
			helpers.ResponseJson(ctx, http.StatusBadRequest, false, nil, "user is not joined")
			return
		}

		if err := database.DB.Model(&card).Association("Members").Delete(&user); err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "failed to leave")
			return
		}

		if err := database.DB.Preload("Members").First(&card, "id = ?", parsedcardid).Error; err != nil {
			helpers.ResponseJson(ctx, http.StatusInternalServerError, false, nil, "card is not found")
			return
		}

		jsonBytes, err := helpers.CreateJsonBytes(card)
		if err != nil {
			panic(err)
		}

		BroadcastEventWithType("card_update", string(jsonBytes))

		helpers.ResponseJson(ctx, http.StatusOK, true, nil, "success leave")
	}
}
