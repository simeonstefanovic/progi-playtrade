from flask import Blueprint, request, jsonify
from database import db
from models.user import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import os

bcrypt = Bcrypt()
auth = Blueprint("auth", __name__)

# Your real Google Client ID
GOOGLE_CLIENT_ID = (
    "908350048308-7gtb4thpdptckllb3hal2jrmctb7a0sl.apps.googleusercontent.com"
)


@auth.post("/signup")
def signup():
    data = request.json
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User.query.filter_by(email=data["email"]).first()
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

    user = User(email=data["email"], password=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify(message="User created")


@auth.post("/login")
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify(error="Prijava nije uspjela. Provjeri upisane podatke."), 401

    if not bcrypt.check_password_hash(user.password, data["password"]):
        return jsonify(error="Prijava nije uspjela. Provjeri upisane podatke."), 401

    token = create_access_token(identity=user.id)
    return jsonify(token=token)


@auth.post("/google-login")
def google_login():
    """
    Accepts: { "credential": "<ID_TOKEN_FROM_GOOGLE>" }
    Verifies token with Google, finds/creates user, returns JWT.
    """
    data = request.get_json()
    credential = data.get("credential")

    if not credential:
        return jsonify(error="Missing Google credential"), 400

    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            credential, grequests.Request(), GOOGLE_CLIENT_ID
        )

        # Extract email (and optionally name, picture)
        email = idinfo.get("email")
        if not email:
            return jsonify(error="Google token nema email adresu."), 400

        # Find or create user
        user = User.query.filter_by(email=email).first()
        if not user:
            # For Google users we can store a random hash, we never use it directly
            random_password = bcrypt.generate_password_hash(
                os.urandom(16)
            ).decode("utf-8")

            user = User(email=email, password=random_password)
            db.session.add(user)
            db.session.commit()

        # Issue JWT
        token = create_access_token(identity=user.id)
        return jsonify(token=token)

    except ValueError:
        # Token invalid or expired
        return jsonify(error="Neispravan Google token."), 401
    except Exception as e:
        print("Google login error:", e)
        return jsonify(error="Dogodila se greška kod Google prijave."), 500
