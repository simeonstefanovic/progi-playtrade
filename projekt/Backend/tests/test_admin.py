import pytest
from models.actualUser import Korisnik
from database import db


class TestAdminAccess:
    
    def test_check_admin_status_admin_user(self, client, admin_user):
        response = client.post('/api/checkAdmin', json={'email': admin_user["email"]})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['isAdmin'] == True
    
    def test_check_admin_status_regular_user(self, client, sample_user):
        response = client.post('/api/checkAdmin', json={'email': sample_user["email"]})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['isAdmin'] == False
    
    def test_check_admin_status_missing_email(self, client):
        response = client.post('/api/checkAdmin', json={})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['isAdmin'] == False


class TestAdminGetUsers:
    
    def test_get_all_users_as_admin(self, client, admin_user, sample_user):
        response = client.get(f'/api/admin/users?adminEmail={admin_user["email"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 2
    
    def test_get_all_users_as_regular_user(self, client, sample_user):
        response = client.get(f'/api/admin/users?adminEmail={sample_user["email"]}')
        
        assert response.status_code == 403
    
    def test_get_all_users_missing_email(self, client):
        response = client.get('/api/admin/users')
        
        assert response.status_code == 403


class TestAdminDeleteUser:
    
    def test_delete_user_as_admin(self, app, client, admin_user):
        with app.app_context():
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt(app)
            hashed = bcrypt.generate_password_hash("pass123").decode("utf-8")
            
            user_to_delete = Korisnik(
                email='todelete@example.com',
                passwordHash=hashed,
                username='ToDelete',
                jeAdmin=0
            )
            db.session.add(user_to_delete)
            db.session.commit()
            user_id = user_to_delete.id
        
        response = client.delete(
            f'/api/admin/users/{user_id}?adminEmail={admin_user["email"]}'
        )
        
        assert response.status_code == 200
        
        with app.app_context():
            deleted_user = Korisnik.query.get(user_id)
            assert deleted_user is None
    
    def test_delete_user_as_regular_user(self, app, client, sample_user):
        with app.app_context():
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt(app)
            hashed = bcrypt.generate_password_hash("pass123").decode("utf-8")
            
            other_user = Korisnik(
                email='other@example.com',
                passwordHash=hashed,
                username='Other',
                jeAdmin=0
            )
            db.session.add(other_user)
            db.session.commit()
            user_id = other_user.id
        
        response = client.delete(
            f'/api/admin/users/{user_id}?adminEmail={sample_user["email"]}'
        )
        
        assert response.status_code == 403
    
    def test_delete_nonexistent_user(self, client, admin_user):
        response = client.delete(
            f'/api/admin/users/99999?adminEmail={admin_user["email"]}'
        )
        
        assert response.status_code == 404
    
    def test_admin_cannot_delete_self(self, client, admin_user):
        response = client.delete(
            f'/api/admin/users/{admin_user["id"]}?adminEmail={admin_user["email"]}'
        )
        
        assert response.status_code == 400


class TestAdminGetListings:
    
    def test_get_all_listings_as_admin(self, client, admin_user, sample_game):
        response = client.get(f'/api/admin/listings?adminEmail={admin_user["email"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_get_all_listings_as_regular_user(self, client, sample_user):
        response = client.get(f'/api/admin/listings?adminEmail={sample_user["email"]}')
        
        assert response.status_code == 403


class TestAdminDeleteListing:
    
    def test_admin_delete_any_listing(self, client, admin_user, sample_game):
        response = client.delete(
            f'/api/admin/listings/{sample_game["id"]}?adminEmail={admin_user["email"]}'
        )
        
        assert response.status_code == 200
    
    def test_regular_user_cannot_admin_delete(self, client, sample_user, sample_game):
        response = client.delete(
            f'/api/admin/listings/{sample_game["id"]}?adminEmail={sample_user["email"]}'
        )
        
        assert response.status_code == 403
