package model

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"-"`
	Name      string `gorm:"size:100;not null"`
	Username  string `gorm:"size:100;not null;uniqueIndex"`
	Email     string `gorm:"size:100;uniqueIndex;not null"`
	Password  string `gorm:"not null" json:"-"`
	Role      string `gorm:"size:20;default:'user'"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
