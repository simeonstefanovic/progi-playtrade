from database import db

class Zanr(db.Model):
    __tablename__ = 'zanr'
    id = db.Column(db.Integer, primary_key=True)
    naziv_zanr = db.Column(db.String(50), nullable=False)
    zainteresirani = db.relationship('Interes', backref='zanr', lazy=True)