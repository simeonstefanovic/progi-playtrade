from flask import Flask
from flask_cors import CORS
from config import Config
from database import db
from routes.auth import auth
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
JWTManager(app)
bcrypt = Bcrypt(app)

app.register_blueprint(auth, url_prefix="/api")

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
