package model

type Login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Register struct {
	Name     string `json:"name" binding:"required"`
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
