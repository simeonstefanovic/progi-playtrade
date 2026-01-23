from flask import Blueprint, request, jsonify
from database import db
from models.zamjena import Zamjena, ZamjenaIgra
from models.igra import Igra
from models.ponuda import Ponuda
from models.actualUser import Korisnik
from datetime import datetime
from utils.email_service import (
    send_trade_offer_notification,
    send_trade_accepted_notification,
    send_trade_rejected_notification,
    send_counter_offer_notification
)

zamjene = Blueprint("zamjene", __name__)


def get_user_id_from_email(email):
    user = Korisnik.query.filter_by(email=email).first()
    return user.id if user else None


@zamjene.post("/trades")
def create_trade():
    data = request.json or {}
    
    email = data.get('email')
    trazena_igra_id = data.get('trazenaIgraId')
    ponudjene_igre_ids = data.get('ponudjeneIgreIds', [])
    
    if not email or not trazena_igra_id or not ponudjene_igre_ids:
        return jsonify(error="Email, trazenaIgraId i ponudjeneIgreIds su obavezni."), 400
    
    ponuditelj_id = get_user_id_from_email(email)
    if not ponuditelj_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    trazena_igra = Igra.query.get(trazena_igra_id)
    if not trazena_igra:
        return jsonify(error="Tražena igra nije pronađena."), 404
    
    ponuda = Ponuda.query.filter_by(id_igra=trazena_igra_id, jeAktivna=1).first()
    if not ponuda:
        return jsonify(error="Igra nije dostupna za zamjenu."), 400
    
    primatelj_id = ponuda.id_korisnik
    
    if ponuditelj_id == primatelj_id:
        return jsonify(error="Ne možete ponuditi zamjenu za vlastitu igru."), 400
    
    for igra_id in ponudjene_igre_ids:
        user_ponuda = Ponuda.query.filter_by(id_igra=igra_id, id_korisnik=ponuditelj_id, jeAktivna=1).first()
        if not user_ponuda:
            return jsonify(error=f"Igra {igra_id} vam ne pripada ili nije aktivna."), 400
    
    zamjena = Zamjena(
        id_ponuditelj=ponuditelj_id,
        id_primatelj=primatelj_id,
        id_trazena_igra=trazena_igra_id,
        status='pending',
        ponuditelj_vidio=True,
        primatelj_vidio=False
    )
    db.session.add(zamjena)
    db.session.flush()
    
    for igra_id in ponudjene_igre_ids:
        zamjena_igra = ZamjenaIgra(id_zamjena=zamjena.id, id_igra=igra_id)
        db.session.add(zamjena_igra)
    
    try:
        db.session.commit()
        
        primatelj = Korisnik.query.get(primatelj_id)
        ponuditelj = Korisnik.query.get(ponuditelj_id)
        offered_game_names = [Igra.query.get(gid).naziv for gid in ponudjene_igre_ids]
        
        if primatelj and ponuditelj:
            send_trade_offer_notification(
                to_email=primatelj.email,
                offerer_name=ponuditelj.username,
                requested_game=trazena_igra.naziv,
                offered_games=offered_game_names
            )
        
        return jsonify(message="Ponuda za zamjenu uspješno poslana!", tradeId=zamjena.id), 201
    except Exception as e:
        db.session.rollback()
        print(f"Database error: {e}")
        return jsonify(error="Greška pri kreiranju ponude."), 500


@zamjene.get("/trades")
def get_trades():
    email = request.args.get('email')
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    trades = Zamjena.query.filter(
        (Zamjena.id_ponuditelj == user_id) | (Zamjena.id_primatelj == user_id)
    ).order_by(Zamjena.vrijeme_kreiranja.desc()).all()
    
    result = []
    for trade in trades:
        ponudjene = [{'id': zi.igra.id, 'title': zi.igra.naziv} for zi in trade.ponudjene_igre]
        
        result.append({
            'id': trade.id,
            'status': trade.status,
            'date': trade.vrijeme_kreiranja.strftime('%Y-%m-%d'),
            'trazenaIgra': {
                'id': trade.trazena_igra.id,
                'title': trade.trazena_igra.naziv
            },
            'ponudjeneIgre': ponudjene,
            'ponuditelj': {
                'id': trade.ponuditelj.id,
                'name': trade.ponuditelj.username,
                'email': trade.ponuditelj.email
            },
            'primatelj': {
                'id': trade.primatelj.id,
                'name': trade.primatelj.username,
                'email': trade.primatelj.email
            },
            'isIncoming': trade.id_primatelj == user_id,
            'seen': trade.primatelj_vidio if trade.id_primatelj == user_id else trade.ponuditelj_vidio
        })
    
    return jsonify(result)


@zamjene.get("/trades/<int:trade_id>/offerer-games")
def get_offerer_games(trade_id):
    email = request.args.get('email')
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    trade = Zamjena.query.get(trade_id)
    if not trade:
        return jsonify(error="Zamjena nije pronađena."), 404
    
    if trade.id_primatelj != user_id:
        return jsonify(error="Nemate pristup."), 403
    
    ponude = Ponuda.query.filter_by(id_korisnik=trade.id_ponuditelj, jeAktivna=1).all()
    
    result = []
    for ponuda in ponude:
        game = ponuda.igra
        result.append({
            'id': game.id,
            'title': game.naziv,
            'hasImage': game.fotografija is not None
        })
    
    return jsonify(result)

@zamjene.get("/trades/pending-count")
def get_pending_count():
    email = request.args.get('email')
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    count = Zamjena.query.filter(
        Zamjena.id_primatelj == user_id,
        Zamjena.primatelj_vidio == False,
        Zamjena.status == 'pending'
    ).count()
    
    return jsonify(count=count)


@zamjene.post("/trades/<int:trade_id>/respond")
def respond_to_trade(trade_id):
    data = request.json or {}
    
    email = data.get('email')
    action = data.get('action')
    counter_games = data.get('counterGames', [])
    
    if not email or not action:
        return jsonify(error="Email i action su obavezni."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    trade = Zamjena.query.get(trade_id)
    if not trade:
        return jsonify(error="Zamjena nije pronađena."), 404
    
    if trade.id_primatelj != user_id:
        return jsonify(error="Nemate pravo odgovoriti na ovu ponudu."), 403
    
    if trade.status != 'pending':
        return jsonify(error="Na ovu ponudu je već odgovoreno."), 400
    
    if action == 'accept':
        trade.status = 'completed'
        Ponuda.query.filter_by(id_igra=trade.id_trazena_igra).update({'jeAktivna': 0}, synchronize_session='fetch')
        for zi in trade.ponudjene_igre:
            Ponuda.query.filter_by(id_igra=zi.id_igra).update({'jeAktivna': 0}, synchronize_session='fetch')
        trade.ponuditelj_vidio = False
        
    elif action == 'reject':
        trade.status = 'rejected'
        trade.ponuditelj_vidio = False
        
    elif action == 'counter':
        if not counter_games:
            return jsonify(error="Morate odabrati igre za protupundu."), 400
        new_trade = Zamjena(
            id_ponuditelj=user_id,
            id_primatelj=trade.id_ponuditelj,
            id_trazena_igra=trade.ponudjene_igre[0].id_igra if trade.ponudjene_igre else None,
            status='pending',
            ponuditelj_vidio=True,
            primatelj_vidio=False
        )
        db.session.add(new_trade)
        db.session.flush()
        
        for igra_id in counter_games:
            zi = ZamjenaIgra(id_zamjena=new_trade.id, id_igra=igra_id)
            db.session.add(zi)
        
        trade.status = 'counter'
        trade.ponuditelj_vidio = False
    else:
        return jsonify(error="Nepoznata akcija."), 400
    
    trade.primatelj_vidio = True
    
    try:
        db.session.commit()
        
        primatelj = Korisnik.query.get(trade.id_primatelj)
        ponuditelj = Korisnik.query.get(trade.id_ponuditelj)
        
        if action == 'accept' and ponuditelj and primatelj:
            offered_game_names = ', '.join([zi.igra.naziv for zi in trade.ponudjene_igre])
            send_trade_accepted_notification(
                to_email=ponuditelj.email,
                accepter_name=primatelj.username,
                your_game=offered_game_names,
                received_game=trade.trazena_igra.naziv
            )
        elif action == 'reject' and ponuditelj and primatelj:
            send_trade_rejected_notification(
                to_email=ponuditelj.email,
                rejecter_name=primatelj.username,
                requested_game=trade.trazena_igra.naziv
            )
        elif action == 'counter' and ponuditelj and primatelj:
            counter_game_names = [Igra.query.get(gid).naziv for gid in counter_games]
            original_game = trade.ponudjene_igre[0].igra.naziv if trade.ponudjene_igre else "vaša igra"
            send_counter_offer_notification(
                to_email=ponuditelj.email,
                counter_offerer_name=primatelj.username,
                original_game=original_game,
                counter_games=counter_game_names
            )
        
        return jsonify(message="Odgovor uspješno poslan!")
    except Exception as e:
        db.session.rollback()
        print(f"Database error: {e}")
        return jsonify(error="Greška pri odgovoru."), 500


@zamjene.post("/trades/<int:trade_id>/mark-seen")
def mark_trade_seen(trade_id):
    data = request.json or {}
    email = data.get('email')
    
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    trade = Zamjena.query.get(trade_id)
    if not trade:
        return jsonify(error="Zamjena nije pronađena."), 404
    
    if trade.id_primatelj == user_id:
        trade.primatelj_vidio = True
    elif trade.id_ponuditelj == user_id:
        trade.ponuditelj_vidio = True
    
    try:
        db.session.commit()
        return jsonify(message="Označeno kao viđeno.")
    except Exception:
        db.session.rollback()
        return jsonify(error="Greška."), 500


@zamjene.get("/trades/history")
def get_trade_history():
    email = request.args.get('email')
    if not email:
        return jsonify(error="Email je obavezan."), 400
    
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify(error="Korisnik nije pronađen."), 404
    
    trades = Zamjena.query.filter(
        ((Zamjena.id_ponuditelj == user_id) | (Zamjena.id_primatelj == user_id)),
        Zamjena.status == 'completed'
    ).order_by(Zamjena.vrijeme_azuriranja.desc()).all()
    
    result = []
    for trade in trades:
        ponudjene_names = ', '.join([zi.igra.naziv for zi in trade.ponudjene_igre])
        
        if trade.id_ponuditelj == user_id:
            result.append({
                'id': trade.id,
                'status': 'Završeno',
                'date': trade.vrijeme_azuriranja.strftime('%Y-%m-%d'),
                'offered': ponudjene_names,
                'received': trade.trazena_igra.naziv
            })
        else:
            result.append({
                'id': trade.id,
                'status': 'Završeno',
                'date': trade.vrijeme_azuriranja.strftime('%Y-%m-%d'),
                'offered': trade.trazena_igra.naziv,
                'received': ponudjene_names
            })
    
    return jsonify(result)
