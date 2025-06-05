package model

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"-"`
	Name      string `gorm:"size:100;not null" json:"name"`
	Username  string `gorm:"size:100;not null;uniqueIndex" json:"username"`
	Email     string `gorm:"size:100;uniqueIndex;not null" json:"email"`
	Password  string `gorm:"not null" json:"-"`
	Role      string `gorm:"size:20;default:'user'" json:"role"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
