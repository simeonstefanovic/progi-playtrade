import os

class Config:
    SECRET_KEY = "tajnikljuc"
    JWT_SECRET_KEY = "jwttajnikljuc"
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
