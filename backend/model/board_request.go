package model

type CreateBoard struct {
	Name      string   `json:"name" binding:"required"`
	MembersID []string `json:"members_id" binding:"required"`
}
