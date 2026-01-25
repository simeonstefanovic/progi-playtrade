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
    """Create a second user with a game for trading."""
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


class TestTradedGamesRemoval:
    """Test that games are removed from the main page after a trade is completed."""
    
    def test_games_visible_before_trade(self, client, sample_game, second_user_with_game):
        """Verify both games are visible on the main page before trade."""
        response = client.get('/api/games')
        
        assert response.status_code == 200
        games = response.get_json()
        
        # Both games should be visible
        game_ids = [g['id'] for g in games]
        assert sample_game['id'] in game_ids
        assert second_user_with_game['game_id'] in game_ids
        assert len(games) == 2
    
    def test_games_removed_after_trade_acceptance(self, app, client, sample_user, sample_game, second_user_with_game):
        """Verify games are removed from main page after trade is accepted."""
        # Create a trade offer
        create_response = client.post('/api/trades', json={
            'email': second_user_with_game['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [second_user_with_game['game_id']]
        })
        
        assert create_response.status_code == 201
        trade_id = create_response.get_json()['tradeId']
        
        # Verify games are still visible before acceptance
        response = client.get('/api/games')
        games_before = response.get_json()
        game_ids_before = [g['id'] for g in games_before]
        assert sample_game['id'] in game_ids_before
        assert second_user_with_game['game_id'] in game_ids_before
        
        # Accept the trade
        accept_response = client.post(f'/api/trades/{trade_id}/respond', json={
            'email': sample_user['email'],
            'action': 'accept'
        })
        
        assert accept_response.status_code == 200
        
        # Verify games are now removed from main page
        response = client.get('/api/games')
        games_after = response.get_json()
        game_ids_after = [g['id'] for g in games_after]
        
        # Neither game should be visible anymore
        assert sample_game['id'] not in game_ids_after
        assert second_user_with_game['game_id'] not in game_ids_after
        assert len(games_after) == 0
    
    def test_only_traded_games_removed(self, app, client, sample_user, sample_game, second_user_with_game, sample_genre):
        """Verify only traded games are removed, not all games."""
        # Add a third game from sample_user that won't be traded
        with app.app_context():
            genre = Zanr.query.get(sample_genre['id'])
            user = Korisnik.query.get(sample_user['id'])
            
            third_game = Igra(
                naziv="Pandemic",
                izdavac="Z-Man Games",
                godina_izdanja=2008,
                ocjena_ocuvanosti=5,
                broj_igraca="2-4",
                vrijeme_igranja="45 min",
                procjena_tezine=2,
                dodatan_opis="Cooperative game",
                id_zanr=genre.id
            )
            db.session.add(third_game)
            db.session.flush()
            
            third_ponuda = Ponuda(
                id_korisnik=user.id,
                id_igra=third_game.id,
                jeAktivna=1
            )
            db.session.add(third_ponuda)
            db.session.commit()
            third_game_id = third_game.id
        
        # Verify all three games are visible
        response = client.get('/api/games')
        games_before = response.get_json()
        assert len(games_before) == 3
        
        # Create and accept a trade
        create_response = client.post('/api/trades', json={
            'email': second_user_with_game['email'],
            'trazenaIgraId': sample_game['id'],
            'ponudjeneIgreIds': [second_user_with_game['game_id']]
        })
        trade_id = create_response.get_json()['tradeId']
        
        client.post(f'/api/trades/{trade_id}/respond', json={
            'email': sample_user['email'],
            'action': 'accept'
        })
        
        # Verify only the third game remains visible
        response = client.get('/api/games')
        games_after = response.get_json()
        game_ids_after = [g['id'] for g in games_after]
        
        assert len(games_after) == 1
        assert third_game_id in game_ids_after
        assert sample_game['id'] not in game_ids_after
        assert second_user_with_game['game_id'] not in game_ids_after
