from flask import Blueprint, request, jsonify
from database import db
from models.user import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

bcrypt = Bcrypt()
auth = Blueprint("auth", __name__)

@auth.post("/signup")
def signup():
    data = request.json
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User.query.filter_by(email=data["email"]).first()
    if user:
        return jsonify(error="Registracija nije uspjela. Upisana Email adresa je vec u upotrebi."), 401

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
