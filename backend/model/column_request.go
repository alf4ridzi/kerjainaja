package model

type EditColumnRequest struct {
	Name string `json:"name" binding:"required"`
}
