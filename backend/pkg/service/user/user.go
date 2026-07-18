package user

import (
	"github.com/pdegama/mailtroapp/pkg/models"
	"gorm.io/gorm"
)

type User struct {
	DB *gorm.DB
}

func (u User) GetProfile(userID uint) (*models.Users, error) {
	var user models.Users
	if err := u.DB.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
