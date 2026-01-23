from flask import Blueprint, request, jsonify
from database import db
from models.actualUser import Korisnik
from models.igra import Igra
from models.ponuda import Ponuda
from models.listazelja import ListaZelja
from models.zamjena import Zamjena, ZamjenaIgra

admin = Blueprint("admin", __name__)


def is_admin(email):
    user = Korisnik.query.filter_by(email=email).first()
    return user and user.jeAdmin == 1


@admin.get("/admin/users")
def get_all_users():
    admin_email = request.args.get('adminEmail')
    if not admin_email or not is_admin(admin_email):
        return jsonify(error="Nemate administratorska prava."), 403
    
    users = Korisnik.query.all()
    result = []
    
    for user in users:
        games_count = Ponuda.query.filter_by(id_korisnik=user.id, jeAktivna=1).count()
        
        result.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'isAdmin': user.jeAdmin == 1,
            'gamesCount': games_count,
            'hasProfilePicture': user.fotografija is not None
        })
    
    return jsonify(result)


@admin.delete("/admin/users/<int:user_id>")
def delete_user(user_id):
    admin_email = request.args.get('adminEmail')
    if not admin_email or not is_admin(admin_email):
        return jsonify(error="Nemate administratorska prava."), 403
    
    user = Korisnik.query.get(user_id)
    if not user:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    admin_user = Korisnik.query.filter_by(email=admin_email).first()
    if admin_user and admin_user.id == user_id:
        return jsonify(error="Ne možete obrisati vlastiti račun."), 400
    
    ponude = Ponuda.query.filter_by(id_korisnik=user_id).all()
    for ponuda in ponude:
        ListaZelja.query.filter_by(id_igra=ponuda.id_igra).delete()
        Igra.query.filter_by(id=ponuda.id_igra).delete()
    Ponuda.query.filter_by(id_korisnik=user_id).delete()
    
    ListaZelja.query.filter_by(id_korisnik=user_id).delete()
    ZamjenaIgra.query.filter(
        ZamjenaIgra.id_zamjena.in_(
            db.session.query(Zamjena.id).filter(
                (Zamjena.id_ponuditelj == user_id) | (Zamjena.id_primatelj == user_id)
            )
        )
    ).delete(synchronize_session='fetch')
    Zamjena.query.filter(
        (Zamjena.id_ponuditelj == user_id) | (Zamjena.id_primatelj == user_id)
    ).delete()
    
    from models.interes import Interes
    Interes.query.filter_by(id_korisnik=user_id).delete()
    db.session.delete(user)
    
    try:
        db.session.commit()
        return jsonify(message="Korisnik uspješno obrisan!")
    except Exception as e:
        db.session.rollback()
        print(f"Database error: {e}")
        return jsonify(error="Greška pri brisanju korisnika."), 500


@admin.put("/admin/users/<int:user_id>/toggle-admin")
def toggle_admin(user_id):
    data = request.json or {}
    admin_email = data.get('adminEmail')
    
    if not admin_email or not is_admin(admin_email):
        return jsonify(error="Nemate administratorska prava."), 403
    
    user = Korisnik.query.get(user_id)
    if not user:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    user.jeAdmin = 0 if user.jeAdmin == 1 else 1
    
    try:
        db.session.commit()
        return jsonify(message="Admin status ažuriran!", isAdmin=user.jeAdmin == 1)
    except Exception as e:
        db.session.rollback()
        return jsonify(error="Greška pri ažuriranju."), 500


@admin.get("/admin/listings")
def get_all_listings():
    admin_email = request.args.get('adminEmail')
    if not admin_email or not is_admin(admin_email):
        return jsonify(error="Nemate administratorska prava."), 403
    
    games = Igra.query.all()
    result = []
    
    for game in games:
        ponuda = Ponuda.query.filter_by(id_igra=game.id).first()
        owner = None
        if ponuda:
            owner = Korisnik.query.get(ponuda.id_korisnik)
        
        result.append({
            'id': game.id,
            'title': game.naziv,
            'publisher': game.izdavac,
            'year': game.godina_izdanja,
            'condition': game.ocjena_ocuvanosti,
            'isActive': ponuda.jeAktivna == 1 if ponuda else False,
            'ownerName': owner.username if owner else 'Nepoznato',
            'ownerEmail': owner.email if owner else None,
            'hasImage': game.fotografija is not None
        })
    
    return jsonify(result)


@admin.delete("/admin/listings/<int:game_id>")
def admin_delete_listing(game_id):
    admin_email = request.args.get('adminEmail')
    if not admin_email or not is_admin(admin_email):
        return jsonify(error="Nemate administratorska prava."), 403
    
    game = Igra.query.get(game_id)
    if not game:
        return jsonify(error="Igra nije pronađena."), 404
    
    ListaZelja.query.filter_by(id_igra=game_id).delete()
    Ponuda.query.filter_by(id_igra=game_id).delete()
    
    ZamjenaIgra.query.filter_by(id_igra=game_id).delete()
    Zamjena.query.filter_by(id_trazena_igra=game_id).delete()
    
    db.session.delete(game)
    
    try:
        db.session.commit()
        return jsonify(message="Oglas uspješno obrisan!")
    except Exception as e:
        db.session.rollback()
        return jsonify(error="Greška pri brisanju."), 500


@admin.put("/admin/listings/<int:game_id>/toggle-active")
def toggle_listing_active(game_id):
    data = request.json or {}
    admin_email = data.get('adminEmail')
    
    if not admin_email or not is_admin(admin_email):
        return jsonify(error="Nemate administratorska prava."), 403
    
    ponuda = Ponuda.query.filter_by(id_igra=game_id).first()
    if not ponuda:
        return jsonify(error="Ponuda nije pronađena."), 404
    
    ponuda.jeAktivna = 0 if ponuda.jeAktivna == 1 else 1
    
    try:
        db.session.commit()
        return jsonify(message="Status ažuriran!", isActive=ponuda.jeAktivna == 1)
    except Exception as e:
        db.session.rollback()
        return jsonify(error="Greška pri ažuriranju."), 500


@admin.get("/admin/stats")
def get_admin_stats():
    """Get platform statistics (admin only)"""
    admin_email = request.args.get('adminEmail')
    if not admin_email or not is_admin(admin_email):
        return jsonify(error="Nemate administratorska prava."), 403
    
    total_users = Korisnik.query.count()
    total_games = Igra.query.count()
    active_listings = Ponuda.query.filter_by(jeAktivna=1).count()
    completed_trades = Zamjena.query.filter_by(status='completed').count()
    pending_trades = Zamjena.query.filter_by(status='pending').count()
    
    return jsonify({
        'totalUsers': total_users,
        'totalGames': total_games,
        'activeListings': active_listings,
        'completedTrades': completed_trades,
        'pendingTrades': pending_trades
    })
