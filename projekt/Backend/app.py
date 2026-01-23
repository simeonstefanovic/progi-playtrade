from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from database import db
from routes.auth import auth
from routes.profil import profile
from routes.igre import igre
from routes.zamjene import zamjene
from routes.admin import admin
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
import os

from models.actualUser import Korisnik
from models.zanr import Zanr
from models.interes import Interes
from models.igra import Igra
from models.ponuda import Ponuda
from models.listazelja import ListaZelja
from models.zamjena import Zamjena, ZamjenaIgra

app = Flask(__name__, static_folder="../Frontend/build", static_url_path="/")
app.config.from_object(Config)

if app.config.get("DEBUG", False):
    CORS(app)

db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

app.register_blueprint(auth, url_prefix="/api")
app.register_blueprint(profile, url_prefix="/api")
app.register_blueprint(igre, url_prefix="/api")
app.register_blueprint(zamjene, url_prefix="/api")
app.register_blueprint(admin, url_prefix="/api")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def server_react(path):
    build_dir = app.static_folder
    file_path = os.path.join(build_dir, path)

    if path != "" and os.path.exists(file_path):
        return send_from_directory(build_dir, path) 
    else:
        return send_from_directory(build_dir, "index.html") 


with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
