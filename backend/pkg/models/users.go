package models

import "time"

type Users struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Fullname  string    `gorm:"type:varchar(255);not null" json:"fullname"`
	Username  string    `gorm:"type:varchar(255);UniqueIndex;not null" json:"username"`
	Password  string    `gorm:"type:varchar(255);not null" json:"password"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
