from database import db

class ListaZelja(db.Model):
    __tablename__ = 'lista_zelja'
    id_korisnik = db.Column(db.Integer, db.ForeignKey('korisnik.id'), primary_key=True)
    id_igra = db.Column(db.Integer, db.ForeignKey('igra.id'), primary_key=True)
    
    korisnik = db.relationship('Korisnik', backref='lista_zelja', lazy=True)
