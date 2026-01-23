from database import db
from sqlalchemy.dialects.sqlite import BLOB

class Igra(db.Model):
    __tablename__ = 'igra'
    id = db.Column(db.Integer, primary_key=True)
    naziv = db.Column(db.String(250), nullable=False)
    izdavac = db.Column(db.String(100), nullable=False)
    godina_izdanja = db.Column(db.Integer, nullable=False)
    ocjena_ocuvanosti = db.Column(db.Integer, nullable=False)
    broj_igraca = db.Column(db.String(10), nullable=False)
    vrijeme_igranja = db.Column(db.String(15), nullable=False)
    procjena_tezine = db.Column(db.Integer, nullable=False)
    fotografija = db.Column(BLOB, nullable=True)
    dodatan_opis = db.Column(db.String(500), nullable=True)
    id_zanr = db.Column(db.Integer, db.ForeignKey('zanr.id'), nullable=False)
    
    zanr = db.relationship('Zanr', backref='igre', lazy=True)
    ponude = db.relationship('Ponuda', backref='igra', lazy=True)
    lista_zelja = db.relationship('ListaZelja', backref='igra', lazy=True)
