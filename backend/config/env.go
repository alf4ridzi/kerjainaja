package config

import (
	"os"
	"path/filepath"
	"runtime"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Join(filepath.Dir(b), "..")
	envPath := filepath.Join(basePath, ".env")

	err := godotenv.Load(envPath)
	if err != nil {
		panic(err)
	}
}

func Env(key string) string {
	LoadEnv()

	return os.Getenv(key)
}
