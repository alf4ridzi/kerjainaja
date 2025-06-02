package helpers

import (
	"kerjainaja/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func createToken(claim jwt.MapClaims) (string, error) {
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	tokenString, err := claims.SignedString([]byte(config.Env("JWT_SECRET")))
	return tokenString, err
}

func CreateTokenSession(id uint, username string, role string, expired time.Time) (string, error) {
	claims := jwt.MapClaims{
		"sub":      id,
		"username": username,
		"role":     role,
		"exp":      expired.Unix(),
	}

	return createToken(claims)
}
