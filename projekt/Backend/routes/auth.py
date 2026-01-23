from flask import Blueprint, request, jsonify
from database import db
from models.user import User
from models.actualUser import Korisnik
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import os

bcrypt = Bcrypt()
auth = Blueprint("auth", __name__)

GOOGLE_CLIENT_ID = (
    "908350048308-7gtb4thpdptckllb3hal2jrmctb7a0sl.apps.googleusercontent.com"
)


@auth.post("/signup")
def signup():
    data = request.json
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = Korisnik.query.filter_by(email=data["email"]).first()
    if user:
        return (
            jsonify(
                error=(
                    "Registracija nije uspjela. "
                    "Upisana Email adresa je vec u upotrebi."
                )
            ),
            401,
        )

    user = Korisnik(email=data["email"], passwordHash=hashed, username="Novi korisnik", jeAdmin=0)
    db.session.add(user)
    try:
        db.session.commit()
    except Exception:
        print("Failed to register user! Database error!")
        return jsonify(message="User not created!")
    

    return jsonify(message="User created")


@auth.post("/login")
def login():
    data = request.json

    user = Korisnik.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify(error="Prijava nije uspjela. Provjeri upisane podatke."), 401

    if not bcrypt.check_password_hash(user.passwordHash, data["password"]):
        return jsonify(error="Prijava nije uspjela. Provjeri upisane podatke."), 401

    token = create_access_token(identity=user.id)
    return jsonify(token=token)


@auth.post("/google-login")
def google_login():
    data = request.get_json()
    credential = data.get("credential")

    if not credential:
        return jsonify(error="Missing Google credential"), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            credential, grequests.Request(), GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        if not email:
            return jsonify(error="Google token nema email adresu."), 400

        user = Korisnik.query.filter_by(email=email).first()
        if not user:
            random_password = bcrypt.generate_password_hash(
                os.urandom(16)
            ).decode("utf-8")

            user = Korisnik(email=email, passwordHash=random_password, username="Novi korisnik", jeAdmin=0)
            db.session.add(user)
            db.session.commit()

        token = create_access_token(identity=user.id)
        return jsonify(token=token, email=email)

    except ValueError:
        return jsonify(error="Neispravan Google token."), 401
    except Exception as e:
        print("Google login error:", e)
        return jsonify(error="Dogodila se greška kod Google prijave."), 500


@auth.post("/checkAdmin")
def check_admin():
    data = request.json or {}
    email = data.get('email')
    
    if not email:
        return jsonify(isAdmin=False)
    
    user = Korisnik.query.filter_by(email=email).first()
    if not user:
        return jsonify(isAdmin=False)
    
    return jsonify(isAdmin=user.jeAdmin == 1)