package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ResponseBoards struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Members []User    `json:"members"`
	Columns []Column  `json:"columns"`
}

type Board struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Members   []User    `gorm:"many2many:board_members" json:"members"`
	Columns   []Column  `gorm:"foreignKey:BoardID" json:"columns"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (b *Board) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}

type Column struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	BoardID   uuid.UUID `gorm:"type:char(36);not null" json:"board_id"`
	Cards     []Card    `gorm:"foreignKey:ColumnID" json:"cards"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (c *Column) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.New()
	return
}

type Card struct {
	ID          uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Title       string    `gorm:"size:255;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	DueDate     string    `json:"due_date"`
	ColumnID    uuid.UUID `gorm:"type:char(36);not null" json:"column_id"`
	Members     []User    `gorm:"many2many:card_members" json:"members"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (c *Card) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.New()
	return
}
