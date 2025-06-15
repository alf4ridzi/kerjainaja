package model

type CreateBoard struct {
	Name string `json:"name" binding:"required"`
}

type AddBoard struct {
	Name    string `json:"name"`
	BoardID string `json:"board_id"`
}
