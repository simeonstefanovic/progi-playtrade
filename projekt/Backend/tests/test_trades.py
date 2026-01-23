import pytest
from models.zamjena import Zamjena, ZamjenaIgra
from models.igra import Igra
from models.ponuda import Ponuda
from models.actualUser import Korisnik
from models.zanr import Zanr
from database import db
from flask_bcrypt import Bcrypt


@pytest.fixture
def second_user_with_game(app, sample_genre):
    with app.app_context():
        bcrypt = Bcrypt(app)
        hashed = bcrypt.generate_password_hash("password123").decode("utf-8")
        
        user = Korisnik(
            email="trader@example.com",
            passwordHash=hashed,
            username="TraderUser",
            jeAdmin=0
        )
        db.session.add(user)
        db.session.flush()
        
        genre = Zanr.query.get(sample_genre['id'])
        game = Igra(
            naziv="Ticket to Ride",
            izdavac="Days of Wonder",
            godina_izdanja=2004,
            ocjena_ocuvanosti=5,
            broj_igraca="2-5",
            vrijeme_igranja="45-90 min",
            procjena_tezine=2,
            dodatan_opis="A train adventure game",
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
            'user_id': user.id,
            'email': user.email,
            'game_id': game.id,
            'game_title': game.naziv
        }


class TestCreateTrade:
    
    def test_create_trade_success(self, client, sample_user, sample_game, second_user_with_game):
        response = client.post('/api/trades', json={
            'email': second_user_with_game['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [second_user_with_game['game_id']]
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'tradeId' in data
    
    def test_create_trade_missing_params(self, client):
        response = client.post('/api/trades', json={})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_create_trade_own_game(self, client, sample_user, sample_game):
        response = client.post('/api/trades', json={
            'email': sample_user['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [sample_game['id']]
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'vlastitu' in data['error'].lower() or 'own' in data['error'].lower()
    
    def test_create_trade_nonexistent_game(self, client, sample_user, sample_game):
        response = client.post('/api/trades', json={
            'email': sample_user['email'],
            'trazenaIgraId': 99999,
            'ponudjeneIgreIds': [sample_game['id']]
        })
        
        assert response.status_code == 404


class TestGetTrades:
    
    def test_get_trades_success(self, client, sample_user):
        response = client.get(f'/api/trades?email={sample_user["email"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_get_trades_missing_email(self, client):
        response = client.get('/api/trades')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_get_trades_nonexistent_user(self, client):
        response = client.get('/api/trades?email=nonexistent@example.com')
        
        assert response.status_code == 404


class TestRespondToTrade:
    
    def test_respond_accept_success(self, app, client, sample_user, sample_game, second_user_with_game):
        create_response = client.post('/api/trades', json={
            'email': second_user_with_game['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [second_user_with_game['game_id']]
        })
        trade_id = create_response.get_json()['tradeId']
        
        response = client.post(f'/api/trades/{trade_id}/respond', json={
            'email': sample_user['email'],
            'action': 'accept'
        })
        
        assert response.status_code == 200
    
    def test_respond_reject_success(self, app, client, sample_user, sample_game, second_user_with_game):
        create_response = client.post('/api/trades', json={
            'email': second_user_with_game['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [second_user_with_game['game_id']]
        })
        trade_id = create_response.get_json()['tradeId']
        
        response = client.post(f'/api/trades/{trade_id}/respond', json={
            'email': sample_user['email'],
            'action': 'reject'
        })
        
        assert response.status_code == 200
    
    def test_respond_invalid_action(self, app, client, sample_user, sample_game, second_user_with_game):
        create_response = client.post('/api/trades', json={
            'email': second_user_with_game['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [second_user_with_game['game_id']]
        })
        trade_id = create_response.get_json()['tradeId']
        
        response = client.post(f'/api/trades/{trade_id}/respond', json={
            'email': sample_user['email'],
            'action': 'invalid_action'
        })
        
        assert response.status_code == 400
    
    def test_respond_nonexistent_trade(self, client, sample_user):
        response = client.post('/api/trades/99999/respond', json={
            'email': sample_user['email'],
            'action': 'accept'
        })
        
        assert response.status_code == 404


class TestGetPendingCount:
    
    def test_get_pending_count(self, client, sample_user):
        response = client.get(f'/api/trades/pending-count?email={sample_user["email"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'count' in data
        assert isinstance(data['count'], int)
    
    def test_get_pending_count_missing_email(self, client):
        response = client.get('/api/trades/pending-count')
        
        assert response.status_code == 400
