import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'playtrade@example.com')
EMAIL_ENABLED = os.environ.get('EMAIL_ENABLED', 'false').lower() == 'true'


def send_email(to_email, subject, html_content, text_content=None):
    if not EMAIL_ENABLED:
        print(f"[EMAIL DISABLED] Would send to {to_email}: {subject}")
        return True
    
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[EMAIL NOT CONFIGURED] Would send to {to_email}: {subject}")
        return True
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        
        if text_content:
            part1 = MIMEText(text_content, 'plain')
            msg.attach(part1)
        
        part2 = MIMEText(html_content, 'html')
        msg.attach(part2)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        
        print(f"[EMAIL SENT] To: {to_email}, Subject: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")
        return False


def send_trade_offer_notification(to_email, offerer_name, requested_game, offered_games):
    subject = f"Nova ponuda za zamjenu - {requested_game}"
    
    offered_list = ", ".join(offered_games) if isinstance(offered_games, list) else offered_games
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">PlayTrade</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">Nova ponuda za zamjenu!</h2>
            <p style="color: #4b5563;">
                <strong>{offerer_name}</strong> želi vašu igru <strong style="color: #7c3aed;">{requested_game}</strong>
            </p>
            <p style="color: #4b5563;">
                U zamjenu nudi: <strong>{offered_list}</strong>
            </p>
            <div style="margin-top: 20px; text-align: center;">
                <a href="https://test.bloodlust-rp.com/profile"
                   style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Pregledaj ponudu
                </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                Prijavite se na PlayTrade kako biste prihvatili, odbili ili izmijenili ponudu.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Nova ponuda za zamjenu na PlayTrade!
    
    {offerer_name} želi vašu igru "{requested_game}".
    U zamjenu nudi: {offered_list}
    
    Prijavite se na PlayTrade kako biste pregledali ponudu.
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_trade_accepted_notification(to_email, accepter_name, your_game, received_game):
    subject = f"✅ Zamjena prihvaćena - {received_game}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎲 PlayTrade</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">✅ Zamjena prihvaćena!</h2>
            <p style="color: #4b5563;">
                <strong>{accepter_name}</strong> je prihvatio/la vašu ponudu!
            </p>
            <p style="color: #4b5563;">
                Dali ste: <strong>{your_game}</strong><br>
                Dobili ste: <strong style="color: #10b981;">{received_game}</strong>
            </p>
            <p style="color: #4b5563;">
                Kontaktirajte korisnika kako biste dogovorili razmjenu.
            </p>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)


def send_trade_rejected_notification(to_email, rejecter_name, requested_game):
    subject = f"❌ Zamjena odbijena - {requested_game}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎲 PlayTrade</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">Zamjena odbijena</h2>
            <p style="color: #4b5563;">
                <strong>{rejecter_name}</strong> je odbio/la vašu ponudu za igru <strong>{requested_game}</strong>.
            </p>
            <p style="color: #4b5563;">
                Možete pokušati ponuditi drugu zamjenu.
            </p>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)


def send_counter_offer_notification(to_email, counter_offerer_name, original_game, counter_games):
    subject = f"🔄 Protupunuda primljena - {original_game}"
    
    counter_list = ", ".join(counter_games) if isinstance(counter_games, list) else counter_games
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎲 PlayTrade</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">🔄 Nova protupunuda!</h2>
            <p style="color: #4b5563;">
                <strong>{counter_offerer_name}</strong> je poslao/la protupunudu!
            </p>
            <p style="color: #4b5563;">
                Traži vašu igru: <strong>{original_game}</strong><br>
                Nudi: <strong style="color: #f59e0b;">{counter_list}</strong>
            </p>
            <div style="margin-top: 20px; text-align: center;">
                <a href="http://localhost:3000/profile" 
                   style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Pregledaj protupunudu
                </a>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)


def send_wishlist_available_notification(to_email, game_name, owner_name):
    subject = f"💫 Igra s liste želja dostupna - {game_name}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎲 PlayTrade</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">💫 Igra s vaše liste želja je dostupna!</h2>
            <p style="color: #4b5563;">
                Igra <strong style="color: #ec4899;">{game_name}</strong> s vaše liste želja 
                je sada dostupna za zamjenu!
            </p>
            <p style="color: #4b5563;">
                Vlasnik: <strong>{owner_name}</strong>
            </p>
            <div style="margin-top: 20px; text-align: center;">
                <a href="http://localhost:3000/games" 
                   style="background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Ponudi zamjenu
                </a>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)
