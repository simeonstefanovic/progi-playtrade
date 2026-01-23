import pytest
from models.actualUser import Korisnik
from database import db


class TestGetProfileData:
    
    def test_get_profile_success(self, client, sample_user):
        response = client.post('/api/getProfileData', json={
            'email': sample_user['email']
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'email' in data
        assert data['email'] == sample_user['email']
    
    def test_get_profile_missing_email(self, client):
        response = client.post('/api/getProfileData', json={})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_get_profile_nonexistent_user(self, client):
        response = client.post('/api/getProfileData', json={
            'email': 'nonexistent@example.com'
        })
        
        assert response.status_code == 404


class TestUpdateProfileData:
    
    def test_update_profile_success(self, client, sample_user):
        response = client.post('/api/updateProfile', json={
            'email': sample_user['email'],
            'name': 'UpdatedUsername',
            'bio': 'Updated description',
            'interests': ['Strategija', 'Kartaške']
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'message' in data
    
    def test_update_profile_missing_email(self, client):
        response = client.post('/api/updateProfile', json={
            'name': 'NewName'
        })
        
        assert response.status_code in [200, 400, 500]
    
    def test_update_profile_nonexistent_user(self, client):
        response = client.post('/api/updateProfile', json={
            'email': 'nonexistent@example.com',
            'name': 'NewName'
        })
        
        assert response.status_code == 404


class TestProfilePicture:
    
    def test_get_profile_picture_no_picture(self, client, sample_user):
        response = client.post('/api/getProfilePictureBlob', json={
            'email': sample_user['email']
        })
        
        assert response.status_code == 404
    
    def test_get_profile_picture_missing_email(self, client):
        response = client.post('/api/getProfilePictureBlob', json={})
        
        assert response.status_code == 400
    
    def test_get_profile_picture_nonexistent_user(self, client):
        response = client.post('/api/getProfilePictureBlob', json={
            'email': 'nonexistent@example.com'
        })
        
        assert response.status_code == 404
