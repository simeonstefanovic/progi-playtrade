from flask import Blueprint, request, jsonify, send_file
from database import db
from models.actualUser import Korisnik
from models.zanr import Zanr
from models.interes import Interes
from io import BytesIO

profile = Blueprint("profile", __name__)

def getUserIdFromEmail(email):
    result = db.session.execute(db.select(Korisnik).filter_by(email=email)).scalar_one_or_none()
    return result.id if result else None


@profile.post("/updateProfile")
def updateProfile():
    dataDict = request.json
    if (dataDict):
        if ("email" in dataDict):
            user_email = dataDict["email"]
        else:
            Exception("An error has occured: No email!")
        
        print(dataDict)
        userid = getUserIdFromEmail(user_email)
        if not userid:
            return jsonify(message="User not found."), 404
        
        user_to_update = db.session.get(Korisnik, userid)
        if user_to_update:
            if "name" in dataDict:
                user_to_update.username = dataDict["name"]
            if "bio" in dataDict:
                user_to_update.opis = dataDict["bio"]
            if "interests" in dataDict:
                interests = dataDict["interests"]
                db.session.query(Interes).filter_by(id_korisnik=userid).delete()
                
                for interest in interests:
                    db_r = db.session.execute(db.select(Zanr).filter_by(naziv_zanr=interest)).scalar_one_or_none()
                    if not db_r:
                        new_genre = Zanr(naziv_zanr=interest)
                        try:
                            db.session.add(new_genre)
                            db.session.commit()
                        except Exception:
                            print("Commit failed.")
                            db.session.rollback()
                            continue
                        db_r = db.session.execute(db.select(Zanr).filter_by(naziv_zanr=interest)).scalar_one()
                    
                    new_interest = Interes(id_zanr=db_r.id, id_korisnik=userid)
                    db.session.add(new_interest)

            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print("Unable to update description: A database error occured.")
                return jsonify(message="Description not updated.")
            return jsonify(message="Description updated")
        else:
            return jsonify(message="Unable to update description: User not found.")
        
@profile.post("/getProfileData")
def findProfileData():
    dataDict = request.json
    print(dataDict)
    if not dataDict or "email" not in dataDict:
        return jsonify(error="Email is required."), 400
    
    userEmail = dataDict["email"]
    try:
        userid = getUserIdFromEmail(userEmail)
        user = db.session.get(Korisnik, userid)
        if user:
            print(user.interesira)
            interest_names = [interes.zanr.naziv_zanr for interes in user.interesira]
            data = {"name":user.username, 
                    "location":"Zagreb, Hrvatska", "bio":user.opis, "email":user.email, 
                    "interests": interest_names, "imageUrl":'https://placehold.co/128x128/60a5fa/ffffff?text=User&font=inter'
            }
            return jsonify(data)
        else:
            return jsonify(error="User not found."), 404
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify(error="User not found."), 404

@profile.post("/getProfilePictureBlob")
def getProfilePictureBlob():
    dataDict = request.json
    if not dataDict or "email" not in dataDict:
        return jsonify(error="Email required."), 400
    
    userEmail = dataDict["email"]
    userid = getUserIdFromEmail(userEmail)
    if not userid:
        return jsonify(error="User not found."), 404
    
    user = db.session.get(Korisnik, userid)
    if user and user.fotografija:
        return send_file(BytesIO(user.fotografija), mimetype='image/jpeg')
    else:
        return jsonify(error="No profile picture found."), 404
    


@profile.post("/setProfilePictureBlob")
def setProfilePictureBlob():
    if 'imageBlob' not in request.files or 'email' not in request.form:
        return jsonify(error="Missing file or email."), 400
    
    file = request.files['imageBlob']
    userEmail = request.form['email']
    
    if file.filename == '':
        return jsonify(error="No file selected."), 400
    
    userid = getUserIdFromEmail(userEmail)
    if not userid:
        return jsonify(error="User not found."), 404
    
    user = db.session.get(Korisnik, userid)
    if user:
        user.fotografija = file.read()
        try:
            db.session.commit()
            return jsonify(message="New picture set!")
        except Exception as e:
            db.session.rollback()
            print(f"Database error: {e}")
            return jsonify(error="Picture not updated."), 500
    return jsonify(error="User not found."), 404


@profile.post("/setLocationBlob")
def setLocationBlob():
    if 'locationBlob' not in request.files or 'email' not in request.form:
        return jsonify(error="Missing file or email."), 400

    file = request.files['locationBlob']
    userEmail = request.form['email']

    if file.filename == '':
        return jsonify(error="No file selected."), 400

    userid = getUserIdFromEmail(userEmail)
    if not userid:
        return jsonify(error="User not found."), 404
    
    user = db.session.get(Korisnik, userid)
    if user:
        user.lokacija = file.read()
        try:
            db.session.commit()
            return jsonify(message="New location set!")
        except Exception as e:
            db.session.rollback()
            print(f"Database error: {e}")
            return jsonify(error="Location not updated."), 500
    return jsonify(error="User not found."), 404

@profile.post("/getLocationBlob")
def getLocationBlob():
    dataDict = request.json
    if not dataDict or "email" not in dataDict:
        return jsonify(error="Email required."), 400

    userEmail = dataDict["email"]
    userid = getUserIdFromEmail(userEmail)
    if not userid:
        return jsonify(error="User not found."), 404
    
    user = db.session.get(Korisnik, userid)
    if user and user.lokacija:
        return send_file(BytesIO(user.lokacija), mimetype='application/json')
    else:
        return jsonify(error="No location found."), 404