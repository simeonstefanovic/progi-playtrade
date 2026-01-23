import os

# Get the base directory for the database
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'tajnikljuc')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwttajnikljuc')
    # Use absolute path for SQLite database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "instance", "database.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Email configuration
    EMAIL_ENABLED = os.environ.get('EMAIL_ENABLED', 'false').lower() == 'true'
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
    FROM_EMAIL = os.environ.get('FROM_EMAIL', '')
