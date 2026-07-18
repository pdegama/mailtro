package auth

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/pdegama/mailtroapp/pkg/config"
	"github.com/pdegama/mailtroapp/pkg/models"
	"github.com/pdegama/mailtroapp/pkg/service/user"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Auth struct {
	DB   *gorm.DB
	User *user.User // other service instence to hold DB connection
}

type AuthCred struct {
	Username string
	Password string
}

func (auth *Auth) Auth(cred *AuthCred) (*models.Users, string, error) {
	var user models.Users
	if err := auth.DB.Where("username = ?", cred.Username).First(&user).Error; err != nil {
		return nil, "", err
	}
	// verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(cred.Password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}
	// generate token
	token, err := auth.generateToken(&user)
	if err != nil {
		return &user, "", err
	}
	return &user, token, nil
}

type AuthRegister struct {
	Username string
	Password string
	Fullname string
}

func (auth *Auth) Register(register *AuthRegister) (*models.Users, string, error) {
	if err := validateUsername(register.Username); err != nil {
		return nil, "", err
	}

	// check if username already exists
	exists, err := auth.UsernameExist(register.Username)
	if err != nil {
		return nil, "", err
	}
	if exists {
		return nil, "", errors.New("username already exists")
	}

	// hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(register.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	user := models.Users{
		Fullname: register.Fullname,
		Username: register.Username,
		Password: string(hashed),
	}

	if err := auth.DB.Create(&user).Error; err != nil {
		return nil, "", err
	}
	token, err := auth.generateToken(&user)
	if err != nil {
		return &user, "", err
	}
	return &user, token, nil
}

func (auth *Auth) UsernameExist(username string) (bool, error) {
	if err := validateUsername(username); err != nil {
		return false, err
	}

	var user models.Users
	if err := auth.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (auth *Auth) GetUserFromToken(tokenString string) (*models.Users, error) {
	secret := config.GetEnv("JWT_SECRET", "supersecret")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	userID, ok := claims["sub"].(float64)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	user, err := auth.User.GetProfile(uint(userID))
	if err != nil {
		return nil, err
	}

	return user, nil
}

func validateUsername(username string) error {
	trimmed := strings.TrimSpace(username)
	if trimmed == "" {
		return errors.New("username is required")
	}
	if len(trimmed) < 3 || len(trimmed) > 64 {
		return errors.New("username must be between 3 and 64 characters")
	}

	validPattern := regexp.MustCompile(`^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{0,62}[a-zA-Z0-9])?$`)
	if !validPattern.MatchString(trimmed) {
		return errors.New("username can only contain letters, numbers, dots, underscores, and hyphens")
	}

	if strings.Contains(trimmed, "..") {
		return errors.New("username cannot contain consecutive dots")
	}
	if strings.HasPrefix(trimmed, ".") || strings.HasSuffix(trimmed, ".") {
		return errors.New("username cannot start or end with a dot")
	}
	return nil
}

func (auth *Auth) generateToken(user *models.Users) (string, error) {
	secret := config.GetEnv("JWT_SECRET", "supersecret")
	claims := jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"fullname": user.Fullname,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return signed, nil
}
