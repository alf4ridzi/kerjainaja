package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Username  string    `gorm:"size:100;not null;uniqueIndex" json:"username"`
	Email     string    `gorm:"size:100;not null;uniqueIndex" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      string    `gorm:"size:20;default:user" json:"role"`
	Boards    []Board   `gorm:"many2many:board_members" json:"boards"`
	Cards     []Card    `gorm:"many2many:card_members" json:"cards,omitempty"` // optional
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
