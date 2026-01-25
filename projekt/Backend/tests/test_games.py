import pytest
from models.igra import Igra
from models.ponuda import Ponuda
from models.listazelja import ListaZelja
from database import db


class TestGetGames:
    
    def test_get_all_games(self, client, sample_game):
        response = client.get('/api/games')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_all_games_empty(self, client):
        response = client.get('/api/games')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)


class TestGetMyGames:
    
    def test_get_my_games_success(self, client, sample_game, sample_user):
        response = client.get(f'/api/myGames?email={sample_user["email"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]['title'] == sample_game['naziv']
    
    def test_get_my_games_missing_email(self, client):
        response = client.get('/api/myGames')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_get_my_games_nonexistent_user(self, client):
        response = client.get('/api/myGames?email=nonexistent@example.com')
        
        assert response.status_code == 404


class TestGetGenres:
    
    def test_get_genres(self, client, sample_genre):
        response = client.get('/api/genres')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestGameDetails:
    
    def test_get_game_details(self, client, sample_game):
        response = client.get(f'/api/games/{sample_game["id"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['title'] == sample_game['naziv']
    
    def test_get_game_details_nonexistent(self, client):
        response = client.get('/api/games/99999')
        
        assert response.status_code == 404


class TestWishlist:
    
    def test_add_to_wishlist(self, app, client, sample_user, sample_game):
        with app.app_context():
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt(app)
            hashed = bcrypt.generate_password_hash("pass123").decode("utf-8")
            other_user = Korisnik(
                email="other@example.com",
                passwordHash=hashed,
                username="OtherUser",
                jeAdmin=0
            )
            db.session.add(other_user)
            db.session.commit()
            other_email = other_user.email
        
        response = client.post('/api/wishlist', json={
            'email': other_email,
            'gameId': sample_game['id']
        })
        
        assert response.status_code == 201
    
    def test_add_to_wishlist_missing_params(self, client):
        response = client.post('/api/wishlist', json={})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_get_wishlist(self, client, sample_user):
        response = client.get(f'/api/wishlist?email={sample_user["email"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_get_wishlist_missing_email(self, client):
        response = client.get('/api/wishlist')
        
        assert response.status_code == 400


class TestDeleteGame:
    
    def test_delete_game_success(self, client, sample_game, sample_user):
        response = client.delete(
            f'/api/games/{sample_game["id"]}?email={sample_user["email"]}'
        )
        
        assert response.status_code == 200
    
    def test_delete_game_not_owner(self, app, client, sample_game):
        with app.app_context():
            from flask_bcrypt import Bcrypt
            from models.actualUser import Korisnik
            bcrypt = Bcrypt(app)
            hashed = bcrypt.generate_password_hash("pass123").decode("utf-8")
            other_user = Korisnik(
                email="notowner@example.com",
                passwordHash=hashed,
                username="NotOwner",
                jeAdmin=0
            )
            db.session.add(other_user)
            db.session.commit()
        
        response = client.delete(
            f'/api/games/{sample_game["id"]}?email=notowner@example.com'
        )
        
        assert response.status_code == 200
    
    def test_delete_game_nonexistent(self, client, sample_user):
        response = client.delete(
            f'/api/games/99999?email={sample_user["email"]}'
        )
        
        assert response.status_code == 404


from models.actualUser import Korisnik


class TestInactiveGames:
    
    def test_inactive_games_not_returned(self, app, client, sample_user, sample_game):
        """Test that games with jeAktivna=0 are not returned by /api/games"""
        with app.app_context():
            # Deactivate the offer for the sample game
            ponuda = Ponuda.query.filter_by(id_igra=sample_game['id']).first()
            assert ponuda is not None
            ponuda.jeAktivna = 0
            db.session.commit()
        
        # Fetch all games
        response = client.get('/api/games')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Verify the deactivated game is not in the list
        game_ids = [game['id'] for game in data]
        assert sample_game['id'] not in game_ids
    
    def test_traded_games_not_returned(self, app, client, sample_user, sample_game, second_user_with_game):
        """Test that games are removed from listings after a trade is accepted"""
        # Get initial list of games
        initial_response = client.get('/api/games')
        assert initial_response.status_code == 200
        initial_games = initial_response.get_json()
        initial_game_ids = {game['id'] for game in initial_games}
        
        # Verify both games are initially in the list
        assert sample_game['id'] in initial_game_ids
        assert second_user_with_game['game_id'] in initial_game_ids
        
        # Create a trade
        create_response = client.post('/api/trades', json={
            'email': second_user_with_game['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [second_user_with_game['game_id']]
        })
        assert create_response.status_code == 201
        trade_id = create_response.get_json()['tradeId']
        
        # Accept the trade
        accept_response = client.post(f'/api/trades/{trade_id}/respond', json={
            'email': sample_user['email'],
            'action': 'accept'
        })
        assert accept_response.status_code == 200
        
        # Get list of games after trade
        final_response = client.get('/api/games')
        assert final_response.status_code == 200
        final_games = final_response.get_json()
        final_game_ids = {game['id'] for game in final_games}
        
        # Verify both traded games are no longer in the list
        assert sample_game['id'] not in final_game_ids, "Requested game should be removed after trade"
        assert second_user_with_game['game_id'] not in final_game_ids, "Offered game should be removed after trade"
