# backend/config.py


class Config:
    SECRET_KEY = '4321'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///officalalchemy.db'  # SQLite database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
