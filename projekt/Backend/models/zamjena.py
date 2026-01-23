from database import db
from datetime import datetime

class Zamjena(db.Model):
    __tablename__ = 'zamjena'
    id = db.Column(db.Integer, primary_key=True)
    
    id_ponuditelj = db.Column(db.Integer, db.ForeignKey('korisnik.id'), nullable=False)
    
    id_primatelj = db.Column(db.Integer, db.ForeignKey('korisnik.id'), nullable=False)
    
    id_trazena_igra = db.Column(db.Integer, db.ForeignKey('igra.id'), nullable=False)
    
    status = db.Column(db.String(20), nullable=False, default='pending')
    
    vrijeme_kreiranja = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    vrijeme_azuriranja = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    ponuditelj_vidio = db.Column(db.Boolean, default=True)
    primatelj_vidio = db.Column(db.Boolean, default=False)
    
    ponuditelj = db.relationship('Korisnik', foreign_keys=[id_ponuditelj], backref='ponude_poslane')
    primatelj = db.relationship('Korisnik', foreign_keys=[id_primatelj], backref='ponude_primljene')
    trazena_igra = db.relationship('Igra', foreign_keys=[id_trazena_igra])
    ponudjene_igre = db.relationship('ZamjenaIgra', backref='zamjena', lazy=True, cascade='all, delete-orphan')


class ZamjenaIgra(db.Model):
    __tablename__ = 'zamjena_igra'
    id = db.Column(db.Integer, primary_key=True)
    id_zamjena = db.Column(db.Integer, db.ForeignKey('zamjena.id'), nullable=False)
    id_igra = db.Column(db.Integer, db.ForeignKey('igra.id'), nullable=False)
    
    igra = db.relationship('Igra')
