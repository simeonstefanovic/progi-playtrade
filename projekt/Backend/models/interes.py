from database import db

class Interes(db.Model):
    __tablename__ = 'interes'
    id_zanr = db.Column(db.Integer, db.ForeignKey('zanr.id'), primary_key=True)
    id_korisnik = db.Column(db.Integer, db.ForeignKey('korisnik.id'), primary_key=True)
    

