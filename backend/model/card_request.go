package model

type NewCard struct {
	Name        string `json:"name" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	ColumnID    string `json:"column_id" binding:"required"`
}
