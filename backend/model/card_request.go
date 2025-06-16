package model

type NewCard struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	ColumnID    string `json:"column_id" binding:"required"`
}
