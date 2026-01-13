from database import db
from sqlalchemy.dialects.sqlite import BLOB

class Korisnik(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False)
    passwordHash = db.Column(db.Integer, nullable=False)
    fotografija = db.Column(BLOB, nullable=True)
    opis = db.Column(db.String(300), nullable=True)
    lokacija = db.Column(BLOB, nullable=True) # TODO: promijeniti nullable u False
    email = db.Column(db.String(254), nullable=False)
    jeAdmin = db.Column(db.Integer, nullable=False)

    interesira = db.relationship('Interes', backref='user', lazy=True)



