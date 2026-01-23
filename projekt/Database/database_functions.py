import sqlite3

class Database:
    def __init__(self, dbname='prod.db'):
        res = self.__connectToDB(dbname)
        self.conn = res[0]
        self.cursor = res[1]

    def __connectToDB(self, dbname) -> tuple[sqlite3.Connection, sqlite3.Cursor]:
        conn = sqlite3.connect(dbname)
        cursor = conn.cursor()
        return conn, cursor

    def __disconnectFromDB(self) -> bool:
        try:
            self.cursor.close()
            self.conn.commit()
            return True
        except Exception:
            return False

    def getUserIDFromEmail(self, userEmail:str) -> int:
        query = f"SELECT id_korisnik FROM Korisnik WHERE email='{userEmail}';"
        self.cursor.execute(query)
        result = self.cursor.fetchall()
        if result:
            return result[0][0]
        else:
            return -1

    def getUserPassHash(self, userInfo:str|int) -> int:
        if type(userInfo) == str:
            query = f"SELECT passwordHash FROM Korisnik WHERE email='{userInfo}';"
        elif type(userInfo) == int:
            query = f"SELECT passwordHash FROM Korisnik WHERE id_korisnik={userInfo};"
        else:
            return -1
        
        self.cursor.execute(query)
        
        result = self.cursor.fetchall()
        if result:
            return result[0][0]
        else:
            return -1

    def createNewUser(self, username, passHash, lokacija, email, jeAdmin, fotografija="NULL", opis="NULL") -> bool:
        query = f"""INSERT INTO Korisnik(username, passwordHash, fotografija, opis, lokacija, email, jeAdmin) VALUES ('{username}', {passHash}, {fotografija}, {opis}, '{lokacija}', '{email}', {jeAdmin});"""
        try:
            self.cursor.execute(query)
        except Exception as e:
            return False
        
        self.conn.commit()
        return True