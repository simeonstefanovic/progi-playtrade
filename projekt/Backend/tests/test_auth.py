import pytest
from models.actualUser import Korisnik
from database import db


class TestSignup:
    def test_signup_success(self, client):
        response = client.post('/api/signup', json={
            'email': 'newuser@example.com',
            'password': 'securepassword123'
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'message' in data
        assert data['message'] == 'User created'

    def test_signup_duplicate_email(self, client, sample_user):
        response = client.post('/api/signup', json={
            'email': sample_user['email'],
            'password': 'anotherpassword'
        })
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert 'Email adresa' in data['error'] or 'email' in data['error'].lower()

    def test_signup_missing_email(self, client):
        response = client.post('/api/signup', json={
            'password': 'somepassword'
        })
        assert response.status_code in [400, 500]

    def test_signup_missing_password(self, client):
        response = client.post('/api/signup', json={
            'email': 'test@example.com'
        })
        assert response.status_code in [400, 500]


class TestLogin:
    def test_login_success(self, client, sample_user):
        response = client.post('/api/login', json={
            'email': sample_user['email'],
            'password': sample_user['password']
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'token' in data
        assert len(data['token']) > 0

    def test_login_wrong_password(self, client, sample_user):
        response = client.post('/api/login', json={
            'email': sample_user['email'],
            'password': 'wrongpassword'
        })
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data

    def test_login_nonexistent_user(self, client):
        response = client.post('/api/login', json={
            'email': 'nonexistent@example.com',
            'password': 'somepassword'
        })
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data

    def test_login_empty_credentials(self, client):
        response = client.post('/api/login', json={
            'email': '',
            'password': ''
        })
        assert response.status_code == 401
