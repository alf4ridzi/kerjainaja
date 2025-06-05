package helpers

import (
	"errors"
	"fmt"
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

func ParseAndValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(config.Env("JWT_SECRET")), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, fmt.Errorf("token is expired")
		}

		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("token is invalid")
}
