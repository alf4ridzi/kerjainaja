package database

import (
	"fmt"
	"kerjainaja/config"
	"kerjainaja/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	DB_HOST := config.Env("DB_HOST")
	DB_DATABASE := config.Env("DB_DATABASE")
	DB_USERNAME := config.Env("DB_USERNAME")
	DB_PASSWORD := config.Env("DB_PASSWORD")
	DB_PORT := config.Env("DB_PORT")

	dsn := "%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local"
	dsn = fmt.Sprintf(dsn, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	DB = db

	DB.AutoMigrate(&model.User{}, &model.Board{}, &model.Column{}, &model.Card{})
}
