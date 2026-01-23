from flask import Blueprint, request, jsonify, send_file
from database import db
from models.igra import Igra
from models.zanr import Zanr
from models.ponuda import Ponuda
from models.listazelja import ListaZelja
from models.actualUser import Korisnik
from io import BytesIO
import base64
from utils.email_service import send_wishlist_available_notification

igre = Blueprint("igre", __name__)


def get_user_id_from_email(email):
    user = Korisnik.query.filter_by(email=email).first()
    return user.id if user else None


def difficulty_to_int(difficulty_str):
    mapping = {
        'Lagano': 1,
        'Srednje': 2,
        'Teško': 3
    }
    return mapping.get(difficulty_str, 2)


def int_to_difficulty(difficulty_int):
    mapping = {
        1: 'Lagano',
        2: 'Srednje',
        3: 'Teško'
    }
    return mapping.get(difficulty_int, 'Srednje')


@igre.get("/games")
def get_all_games():
    query = request.args.get('query', '').strip().lower()
    difficulty = request.args.get('difficulty', '')
    min_players = request.args.get('minPlayers', type=int)
    max_players = request.args.get('maxPlayers', type=int)
    
    # Only get games that have active offers
    active_game_ids = [p.id_igra for p in Ponuda.query.filter_by(jeAktivna=1).all()]
    games = Igra.query.filter(Igra.id.in_(active_game_ids)).all() if active_game_ids else []
    result = []
    
    for game in games:
        if query and query not in game.naziv.lower():
            continue
        
        if difficulty:
            game_difficulty = int_to_difficulty(game.procjena_tezine)
            if game_difficulty != difficulty:
                continue
        
        if min_players or max_players:
            players_str = game.broj_igraca
            try:
                if '-' in players_str:
                    parts = players_str.split('-')
                    game_min = int(parts[0])
                    game_max = int(parts[1])
                elif '+' in players_str:
                    game_min = int(players_str.replace('+', ''))
                    game_max = 99
                else:
                    game_min = game_max = int(players_str)
                
                if min_players and game_max < min_players:
                    continue
                if max_players and game_min > max_players:
                    continue
            except ValueError:
                pass
        
        ponuda = Ponuda.query.filter_by(id_igra=game.id, jeAktivna=1).first()
        owner_name = None
        owner_email = None
        if ponuda:
            owner = Korisnik.query.get(ponuda.id_korisnik)
            if owner:
                owner_name = owner.username
                owner_email = owner.email
        
        game_data = {
            'id': game.id,
            'title': game.naziv,
            'publisher': game.izdavac,
            'year': game.godina_izdanja,
            'condition': f"{game.ocjena_ocuvanosti}/5",
            'players': game.broj_igraca,
            'playtime': game.vrijeme_igranja,
            'difficulty': int_to_difficulty(game.procjena_tezine),
            'description': game.dodatan_opis,
            'genre': game.zanr.naziv_zanr if game.zanr else None,
            'genreId': game.id_zanr,
            'hasImage': game.fotografija is not None,
            'ownerName': owner_name,
            'ownerEmail': owner_email
        }
        result.append(game_data)
    
    return jsonify(result)


@igre.get("/games/<int:game_id>")
def get_game(game_id):
    game = Igra.query.get(game_id)
    if not game:
        return jsonify(error="Igra nije pronađena."), 404
    
    ponuda = Ponuda.query.filter_by(id_igra=game.id, jeAktivna=1).first()
    owner_name = None
    owner_email = None
    if ponuda:
        owner = Korisnik.query.get(ponuda.id_korisnik)
        if owner:
            owner_name = owner.username
            owner_email = owner.email
    
    return jsonify({
        'id': game.id,
        'title': game.naziv,
        'publisher': game.izdavac,
        'year': game.godina_izdanja,
        'condition': f"{game.ocjena_ocuvanosti}/5",
        'players': game.broj_igraca,
        'playtime': game.vrijeme_igranja,
        'difficulty': int_to_difficulty(game.procjena_tezine),
        'description': game.dodatan_opis,
        'genre': game.zanr.naziv_zanr if game.zanr else None,
        'hasImage': game.fotografija is not None,
        'ownerName': owner_name,
        'ownerEmail': owner_email
    })


@igre.get("/games/<int:game_id>/image")
def get_game_image(game_id):
    game = Igra.query.get(game_id)
    if not game or not game.fotografija:
        return jsonify(error="Slika nije pronađena."), 404
    
    return send_file(BytesIO(game.fotografija), mimetype='image/jpeg')


@igre.post("/games")
def add_game():
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form.to_dict()
        image_file = request.files.get('image')
    else:
        data = request.json or {}
        image_file = None
    
    required = ['naziv', 'izdavac', 'godina_izdanja', 'ocjena_ocuvanosti', 
                'broj_igraca', 'vrijeme_igranja', 'zanr', 'email']
    for field in required:
        if field not in data or not data[field]:
            return jsonify(error=f"Polje '{field}' je obavezno."), 400
    
    genre_name = data['zanr']
    genre = Zanr.query.filter_by(naziv_zanr=genre_name).first()
    if not genre:
        genre = Zanr(naziv_zanr=genre_name)
        db.session.add(genre)
        db.session.flush()
    
    user_id = get_user_id_from_email(data['email'])
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    difficulty = difficulty_to_int(data.get('procjena_tezine', 'Srednje'))
    
    image_data = None
    if image_file:
        image_data = image_file.read()
    elif 'image_base64' in data:
        try:
            image_data = base64.b64decode(data['image_base64'])
        except Exception:
            pass
    
    new_game = Igra(
        naziv=data['naziv'],
        izdavac=data['izdavac'],
        godina_izdanja=int(data['godina_izdanja']),
        ocjena_ocuvanosti=int(data['ocjena_ocuvanosti']),
        broj_igraca=data['broj_igraca'],
        vrijeme_igranja=data['vrijeme_igranja'],
        procjena_tezine=difficulty,
        fotografija=image_data,
        dodatan_opis=data.get('dodatan_opis', ''),
        id_zanr=genre.id
    )
    
    db.session.add(new_game)
    db.session.flush()
    
    ponuda = Ponuda(
        id_korisnik=user_id,
        id_igra=new_game.id,
        jeAktivna=1
    )
    db.session.add(ponuda)
    
    try:
        db.session.commit()
        
        owner = Korisnik.query.get(user_id)
        game_name_lower = data['naziv'].lower()
        
        all_wishlists = db.session.query(ListaZelja, Igra, Korisnik).join(
            Igra, ListaZelja.id_igra == Igra.id
        ).join(
            Korisnik, ListaZelja.id_korisnik == Korisnik.id
        ).filter(
            ListaZelja.id_korisnik != user_id
        ).all()
        
        for wishlist_item, wishlist_game, wishlist_user in all_wishlists:
            if wishlist_game.naziv.lower() == game_name_lower:
                send_wishlist_available_notification(
                    to_email=wishlist_user.email,
                    game_name=data['naziv'],
                    owner_name=owner.username if owner else "Nepoznati korisnik"
                )
        
        return jsonify(message="Igra uspješno dodana!", gameId=new_game.id), 201
    except Exception as e:
        db.session.rollback()
        print(f"Database error: {e}")
        return jsonify(error="Greška pri spremanju igre."), 500


@igre.put("/games/<int:game_id>")
def update_game(game_id):
    game = Igra.query.get(game_id)
    if not game:
        return jsonify(error="Igra nije pronađena."), 404
    
    data = request.json or {}
    
    if 'naziv' in data:
        game.naziv = data['naziv']
    if 'izdavac' in data:
        game.izdavac = data['izdavac']
    if 'godina_izdanja' in data:
        game.godina_izdanja = int(data['godina_izdanja'])
    if 'ocjena_ocuvanosti' in data:
        game.ocjena_ocuvanosti = int(data['ocjena_ocuvanosti'])
    if 'broj_igraca' in data:
        game.broj_igraca = data['broj_igraca']
    if 'vrijeme_igranja' in data:
        game.vrijeme_igranja = data['vrijeme_igranja']
    if 'procjena_tezine' in data:
        game.procjena_tezine = difficulty_to_int(data['procjena_tezine'])
    if 'dodatan_opis' in data:
        game.dodatan_opis = data['dodatan_opis']
    if 'zanr' in data:
        genre = Zanr.query.filter_by(naziv_zanr=data['zanr']).first()
        if not genre:
            genre = Zanr(naziv_zanr=data['zanr'])
            db.session.add(genre)
            db.session.flush()
        game.id_zanr = genre.id
    
    try:
        db.session.commit()
        return jsonify(message="Igra uspješno ažurirana!")
    except Exception as e:
        db.session.rollback()
        return jsonify(error="Greška pri ažuriranju igre."), 500


@igre.delete("/games/<int:game_id>")
def delete_game(game_id):
    game = Igra.query.get(game_id)
    if not game:
        return jsonify(error="Igra nije pronađena."), 404
    
    Ponuda.query.filter_by(id_igra=game_id).delete()
    ListaZelja.query.filter_by(id_igra=game_id).delete()
    
    db.session.delete(game)
    
    try:
        db.session.commit()
        return jsonify(message="Igra uspješno obrisana!")
    except Exception as e:
        db.session.rollback()
        return jsonify(error="Greška pri brisanju igre."), 500


@igre.get("/myGames")
def get_my_games():
    email = request.args.get('email')
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    ponude = Ponuda.query.filter_by(id_korisnik=user_id, jeAktivna=1).all()
    result = []
    
    for ponuda in ponude:
        game = ponuda.igra
        result.append({
            'id': game.id,
            'title': game.naziv,
            'condition': f"{game.ocjena_ocuvanosti}/5",
            'players': game.broj_igraca,
            'playtime': game.vrijeme_igranja,
            'hasImage': game.fotografija is not None,
            'ownerEmail': email
        })
    
    return jsonify(result)


@igre.get("/wishlist")
def get_wishlist():
    email = request.args.get('email')
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    wishlist_items = ListaZelja.query.filter_by(id_korisnik=user_id).all()
    result = []
    
    for item in wishlist_items:
        game = item.igra
        result.append({
            'id': game.id,
            'title': game.naziv,
            'hasImage': game.fotografija is not None
        })
    
    return jsonify(result)


@igre.post("/wishlist")
def add_to_wishlist():
    data = request.json or {}
    
    email = data.get('email')
    game_id = data.get('gameId')
    
    if not email or not game_id:
        return jsonify(error="Email i gameId su obavezni."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    game = Igra.query.get(game_id)
    if not game:
        return jsonify(error="Igra nije pronađena."), 404
    
    existing = ListaZelja.query.filter_by(id_korisnik=user_id, id_igra=game_id).first()
    if existing:
        return jsonify(error="Igra je već na listi želja."), 400
    
    wishlist_item = ListaZelja(id_korisnik=user_id, id_igra=game_id)
    db.session.add(wishlist_item)
    
    try:
        db.session.commit()
        return jsonify(message="Igra dodana na listu želja!"), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(error="Greška pri dodavanju na listu želja."), 500


@igre.delete("/wishlist/<int:game_id>")
def remove_from_wishlist(game_id):
    email = request.args.get('email')
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    wishlist_item = ListaZelja.query.filter_by(id_korisnik=user_id, id_igra=game_id).first()
    if not wishlist_item:
        return jsonify(error="Igra nije na listi želja."), 404
    
    db.session.delete(wishlist_item)
    
    try:
        db.session.commit()
        return jsonify(message="Igra uklonjena s liste želja!")
    except Exception as e:
        db.session.rollback()
        return jsonify(error="Greška pri uklanjanju s liste želja."), 500


@igre.get("/genres")
def get_genres():
    genres = Zanr.query.all()
    return jsonify([{'id': g.id, 'naziv': g.naziv_zanr} for g in genres])
