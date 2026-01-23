from database import db
from datetime import datetime

class Ponuda(db.Model):
    __tablename__ = 'ponuda'
    id_korisnik = db.Column(db.Integer, db.ForeignKey('korisnik.id'), primary_key=True)
    id_igra = db.Column(db.Integer, db.ForeignKey('igra.id'), primary_key=True)
    vrijeme_kreiranja = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    jeAktivna = db.Column(db.Integer, nullable=False, default=1)
    
    korisnik = db.relationship('Korisnik', backref='ponude', lazy=True)
