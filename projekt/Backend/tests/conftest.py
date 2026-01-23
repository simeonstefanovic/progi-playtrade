import pytest
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from database import db
from models.actualUser import Korisnik
from models.zanr import Zanr
from models.interes import Interes
from models.igra import Igra
from models.ponuda import Ponuda
from models.listazelja import ListaZelja
from models.zamjena import Zamjena, ZamjenaIgra


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['PROPAGATE_EXCEPTIONS'] = False
    
    db.init_app(app)
    JWTManager(app)
    Bcrypt(app)
    
    from routes.auth import auth
    from routes.profil import profile
    from routes.igre import igre
    from routes.zamjene import zamjene
    from routes.admin import admin
    
    app.register_blueprint(auth, url_prefix="/api")
    app.register_blueprint(profile, url_prefix="/api")
    app.register_blueprint(igre, url_prefix="/api")
    app.register_blueprint(zamjene, url_prefix="/api")
    app.register_blueprint(admin, url_prefix="/api")
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def bcrypt_instance(app):
    return Bcrypt(app)


@pytest.fixture
def sample_user(app, bcrypt_instance):
    with app.app_context():
        hashed = bcrypt_instance.generate_password_hash("testpassword123").decode("utf-8")
        user = Korisnik(
            email="test@example.com",
            passwordHash=hashed,
            username="TestUser",
            jeAdmin=0,
            opis="Test user description"
        )
        db.session.add(user)
        db.session.commit()
        return {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'password': 'testpassword123'
        }


@pytest.fixture
def admin_user(app, bcrypt_instance):
    with app.app_context():
        hashed = bcrypt_instance.generate_password_hash("adminpass123").decode("utf-8")
        user = Korisnik(
            email="admin@example.com",
            passwordHash=hashed,
            username="AdminUser",
            jeAdmin=1,
            opis="Admin user"
        )
        db.session.add(user)
        db.session.commit()
        return {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'password': 'adminpass123'
        }


@pytest.fixture
def sample_genre(app):
    with app.app_context():
        genre = Zanr(naziv_zanr="Strategija")
        db.session.add(genre)
        db.session.commit()
        return {'id': genre.id, 'naziv': genre.naziv_zanr}


@pytest.fixture
def sample_game(app, sample_user, sample_genre):
    with app.app_context():
        genre = Zanr.query.get(sample_genre['id'])
        user = Korisnik.query.get(sample_user['id'])
        
        game = Igra(
            naziv="Catan",
            izdavac="Kosmos",
            godina_izdanja=1995,
            ocjena_ocuvanosti=4,
            broj_igraca="3-4",
            vrijeme_igranja="60-90 min",
            procjena_tezine=2,
            dodatan_opis="A classic game",
            id_zanr=genre.id
        )
        db.session.add(game)
        db.session.flush()
        
        ponuda = Ponuda(
            id_korisnik=user.id,
            id_igra=game.id,
            jeAktivna=1
        )
        db.session.add(ponuda)
        db.session.commit()
        
        return {
            'id': game.id,
            'naziv': game.naziv,
            'owner_id': user.id,
            'owner_email': user.email
        }


@pytest.fixture
def auth_token(app, sample_user):
    with app.app_context():
        token = create_access_token(identity=sample_user['id'])
        return token


@pytest.fixture
def admin_token(app, admin_user):
    with app.app_context():
        token = create_access_token(identity=admin_user['id'])
        return token
