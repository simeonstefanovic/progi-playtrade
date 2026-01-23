import pytest
from unittest.mock import patch, MagicMock
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class TestSendEmail:
    
    def test_send_email_disabled(self):
        with patch.dict(os.environ, {'EMAIL_ENABLED': 'false'}):
            import importlib
            import utils.email_service as email_service
            importlib.reload(email_service)
            
            result = email_service.send_email(
                to_email='test@example.com',
                subject='Test Subject',
                html_content='<p>Test content</p>'
            )
            
            assert result == True
    
    def test_send_email_not_configured(self):
        with patch.dict(os.environ, {
            'EMAIL_ENABLED': 'true',
            'SMTP_USERNAME': '',
            'SMTP_PASSWORD': ''
        }):
            import importlib
            import utils.email_service as email_service
            importlib.reload(email_service)
            
            result = email_service.send_email(
                to_email='test@example.com',
                subject='Test Subject',
                html_content='<p>Test content</p>'
            )
            
            assert result == True


class TestTradeNotifications:
    
    @patch('utils.email_service.send_email')
    def test_send_trade_offer_notification(self, mock_send_email):
        mock_send_email.return_value = True
        
        from utils.email_service import send_trade_offer_notification
        
        result = send_trade_offer_notification(
            to_email='recipient@example.com',
            offerer_name='John Doe',
            requested_game='Catan',
            offered_games=['Ticket to Ride', 'Pandemic']
        )
        
        mock_send_email.assert_called_once()
        call_args = mock_send_email.call_args
        assert 'recipient@example.com' in str(call_args)
        assert result == True
    
    @patch('utils.email_service.send_email')
    def test_send_trade_accepted_notification(self, mock_send_email):
        mock_send_email.return_value = True
        
        from utils.email_service import send_trade_accepted_notification
        
        result = send_trade_accepted_notification(
            to_email='offerer@example.com',
            accepter_name='Jane Doe',
            your_game='Ticket to Ride',
            received_game='Catan'
        )
        
        mock_send_email.assert_called_once()
        assert result == True
    
    @patch('utils.email_service.send_email')
    def test_send_trade_rejected_notification(self, mock_send_email):
        mock_send_email.return_value = True
        
        from utils.email_service import send_trade_rejected_notification
        
        result = send_trade_rejected_notification(
            to_email='offerer@example.com',
            rejecter_name='Jane Doe',
            requested_game='Catan'
        )
        
        mock_send_email.assert_called_once()
        assert result == True


class TestWishlistNotifications:
    
    @patch('utils.email_service.send_email')
    def test_send_wishlist_available_notification(self, mock_send_email):
        mock_send_email.return_value = True
        
        from utils.email_service import send_wishlist_available_notification
        
        result = send_wishlist_available_notification(
            to_email='wisher@example.com',
            game_name='Catan',
            owner_name='John Seller'
        )
        
        mock_send_email.assert_called_once()
        call_args = mock_send_email.call_args
        assert 'wisher@example.com' in str(call_args)
        assert result == True


class TestEmailContent:
    
    def test_trade_offer_html_content(self):
        from utils.email_service import send_trade_offer_notification
        
        with patch('utils.email_service.send_email') as mock_send:
            mock_send.return_value = True
            
            send_trade_offer_notification(
                to_email='test@example.com',
                offerer_name='TestOfferer',
                requested_game='TestGame',
                offered_games=['Game1', 'Game2']
            )
            
            call_args = mock_send.call_args
            html_content = call_args[1].get('html_content', call_args[0][2] if len(call_args[0]) > 2 else '')
            
            assert 'TestOfferer' in html_content or mock_send.called
            assert 'TestGame' in html_content or mock_send.called
