import pytest
from models.actualUser import Korisnik
from models.igra import Igra
from models.zanr import Zanr
from models.ponuda import Ponuda
from models.listazelja import ListaZelja
from models.zamjena import Zamjena, ZamjenaIgra
from models.interes import Interes
from database import db


class TestKorisnikModel:
    
    def test_create_user(self, app):
        with app.app_context():
            user = Korisnik(
                email='newuser@example.com',
                passwordHash='hashedpassword',
                username='TestUser',
                jeAdmin=0,
                opis='Test description'
            )
            db.session.add(user)
            db.session.commit()
            
            assert user.id is not None
            assert user.email == 'newuser@example.com'
            assert user.username == 'TestUser'
            assert user.jeAdmin == 0
    
    def test_user_required_fields(self, app):
        with app.app_context():
            with pytest.raises(Exception):
                user = Korisnik(
                    email=None,
                    passwordHash='hash',
                    username='Test',
                    jeAdmin=0
                )
                db.session.add(user)
                db.session.commit()
    
    def test_user_relationships(self, app, sample_user, sample_genre):
        with app.app_context():
            user = Korisnik.query.get(sample_user['id'])
            genre = Zanr.query.get(sample_genre['id'])
            
            interest = Interes(id_korisnik=user.id, id_zanr=genre.id)
            db.session.add(interest)
            db.session.commit()
            
            assert len(user.interesira) >= 1


class TestIgraModel:
    
    def test_create_game(self, app, sample_genre):
        with app.app_context():
            genre = Zanr.query.get(sample_genre['id'])
            
            game = Igra(
                naziv='Test Game',
                izdavac='Test Publisher',
                godina_izdanja=2020,
                ocjena_ocuvanosti=4,
                broj_igraca='2-4',
                vrijeme_igranja='30-60 min',
                procjena_tezine=2,
                dodatan_opis='A test game',
                id_zanr=genre.id
            )
            db.session.add(game)
            db.session.commit()
            
            assert game.id is not None
            assert game.naziv == 'Test Game'
            assert game.zanr.naziv_zanr == genre.naziv_zanr
    
    def test_game_difficulty_values(self, app, sample_genre):
        with app.app_context():
            genre = Zanr.query.get(sample_genre['id'])
            
            for difficulty in [1, 2, 3]:
                game = Igra(
                    naziv=f'Game Difficulty {difficulty}',
                    izdavac='Publisher',
                    godina_izdanja=2020,
                    ocjena_ocuvanosti=3,
                    broj_igraca='2-4',
                    vrijeme_igranja='30 min',
                    procjena_tezine=difficulty,
                    id_zanr=genre.id
                )
                db.session.add(game)
            
            db.session.commit()
            
            games = Igra.query.filter(Igra.naziv.like('Game Difficulty%')).all()
            assert len(games) == 3


class TestZanrModel:
    
    def test_create_genre(self, app):
        with app.app_context():
            genre = Zanr(naziv_zanr='Family')
            db.session.add(genre)
            db.session.commit()
            
            assert genre.id is not None
            assert genre.naziv_zanr == 'Family'
    
    def test_genre_with_games(self, app, sample_genre, sample_game):
        with app.app_context():
            genre = Zanr.query.get(sample_genre['id'])
            
            assert len(genre.igre) >= 1
            assert genre.igre[0].naziv == sample_game['naziv']


class TestPonudaModel:
    
    def test_create_ponuda(self, app, sample_user, sample_genre):
        with app.app_context():
            user = Korisnik.query.get(sample_user['id'])
            genre = Zanr.query.get(sample_genre['id'])
            
            game = Igra(
                naziv='Offer Test Game',
                izdavac='Publisher',
                godina_izdanja=2020,
                ocjena_ocuvanosti=4,
                broj_igraca='2-4',
                vrijeme_igranja='60 min',
                procjena_tezine=2,
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
            
            assert ponuda.id_korisnik == user.id
            assert ponuda.id_igra == game.id
            assert ponuda.jeAktivna == 1
            assert ponuda.korisnik.email == sample_user['email']
    
    def test_deactivate_ponuda(self, app, sample_game, sample_user):
        with app.app_context():
            ponuda = Ponuda.query.filter_by(id_igra=sample_game['id']).first()
            ponuda.jeAktivna = 0
            db.session.commit()
            
            updated_ponuda = Ponuda.query.filter_by(
                id_korisnik=ponuda.id_korisnik, 
                id_igra=ponuda.id_igra
            ).first()
            assert updated_ponuda.jeAktivna == 0


class TestZamjenaModel:
    
    def test_create_zamjena(self, app, sample_user, sample_game, sample_genre):
        with app.app_context():
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt(app)
            
            hashed = bcrypt.generate_password_hash("pass").decode("utf-8")
            user2 = Korisnik(
                email='user2@example.com',
                passwordHash=hashed,
                username='User2',
                jeAdmin=0
            )
            db.session.add(user2)
            db.session.flush()
            
            genre = Zanr.query.get(sample_genre['id'])
            game2 = Igra(
                naziv='Trade Game 2',
                izdavac='Publisher',
                godina_izdanja=2020,
                ocjena_ocuvanosti=4,
                broj_igraca='2-4',
                vrijeme_igranja='60 min',
                procjena_tezine=2,
                id_zanr=genre.id
            )
            db.session.add(game2)
            db.session.flush()
            
            ponuda2 = Ponuda(id_korisnik=user2.id, id_igra=game2.id, jeAktivna=1)
            db.session.add(ponuda2)
            db.session.flush()
            
            zamjena = Zamjena(
                id_ponuditelj=user2.id,
                id_primatelj=sample_user['id'],
                id_trazena_igra=sample_game['id'],
                status='pending'
            )
            db.session.add(zamjena)
            db.session.flush()
            
            zamjena_igra = ZamjenaIgra(
                id_zamjena=zamjena.id,
                id_igra=game2.id
            )
            db.session.add(zamjena_igra)
            db.session.commit()
            
            assert zamjena.id is not None
            assert zamjena.status == 'pending'
            assert len(zamjena.ponudjene_igre) == 1
    
    def test_zamjena_status_transitions(self, app, sample_user, sample_game, sample_genre):
        with app.app_context():
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt(app)
            
            hashed = bcrypt.generate_password_hash("pass").decode("utf-8")
            user2 = Korisnik(
                email='statustest@example.com',
                passwordHash=hashed,
                username='StatusUser',
                jeAdmin=0
            )
            db.session.add(user2)
            db.session.flush()
            
            zamjena = Zamjena(
                id_ponuditelj=user2.id,
                id_primatelj=sample_user['id'],
                id_trazena_igra=sample_game['id'],
                status='pending'
            )
            db.session.add(zamjena)
            db.session.commit()
            
            for status in ['accepted', 'rejected', 'completed']:
                zamjena.status = status
                db.session.commit()
                
                updated = Zamjena.query.get(zamjena.id)
                assert updated.status == status


class TestListaZeljaModel:
    
    def test_add_to_wishlist(self, app, sample_user, sample_game):
        with app.app_context():
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt(app)
            hashed = bcrypt.generate_password_hash("pass").decode("utf-8")
            
            other_user = Korisnik(
                email='wisher@example.com',
                passwordHash=hashed,
                username='Wisher',
                jeAdmin=0
            )
            db.session.add(other_user)
            db.session.flush()
            
            wishlist_item = ListaZelja(
                id_korisnik=other_user.id,
                id_igra=sample_game['id']
            )
            db.session.add(wishlist_item)
            db.session.commit()
            
            assert wishlist_item.id_korisnik == other_user.id
            assert wishlist_item.id_igra == sample_game['id']
            assert wishlist_item.igra.naziv == sample_game['naziv']
