import sqlite3

class Database:
    def __init__(self, dbname='prod.db'):
        res = self.__connectToDB(dbname)
        self.conn = res[0]
        self.cursor = res[1]

    def __connectToDB(self, dbname) -> tuple[sqlite3.Connection, sqlite3.Cursor]:
        """
        Establishes connection to specified database (prod.db by default) and a cursor for that database.
        Returns the connection and cursor objects. 
        """
        conn = sqlite3.connect(dbname)
        cursor = conn.cursor()
        return conn, cursor


    def __disconnectFromDB(self) -> bool:
        """
        Closes specified connection and cursor objects.
        Returns True if successful, False otherwise.
        """
        try:
            self.cursor.close()
            self.conn.commit()
            return True
        
        except Exception:
            return False


    def getUserIDFromEmail(self, userEmail:str) -> int:
        """
        Returns the id associated with the specified e-mail address.
        Returns the id if it exists, -1 otherwise.
        """
        query = f"SELECT id_korisnik FROM Korisnik WHERE email='{userEmail}';"
        self.cursor.execute(query)

        result = self.cursor.fetchall()
        if result:
            return result[0][0]
        else:
            return -1


    def getUserPassHash(self, userInfo:str|int) -> int:
        """
        Returns the password hash associated with the specified e-mail address or user id.
        Returns the hash if it exists, -1 otherwise.
        """
        if type(userInfo) == str: # e-mail address
            query = f"SELECT passwordHash FROM Korisnik WHERE email='{userInfo}';"
        elif type(userInfo) == int: # userID
            query = f"SELECT passwordHash FROM Korisnik WHERE id_korisnik={userInfo};"
        else:
            return -1
        
        self.cursor.execute(query)
        
        result = self.cursor.fetchall()
        if result:
            return result[0][0]
        else:
            print("ERROR: No user found.")
            print("query: " + query)
            return -1


    def createNewUser(self, username, passHash, lokacija, email, jeAdmin, fotografija="NULL", opis="NULL") -> bool:
        """
        Creates new user by storing information in the database.
        Returns True if the operation was succesful, False otherwise.
        """
        query = f"""INSERT INTO Korisnik(username, passwordHash, fotografija, opis, lokacija, email, jeAdmin) VALUES ('{username}', {passHash}, {fotografija}, {opis}, '{lokacija}', '{email}', {jeAdmin});"""
        try:
            print(query)
            self.cursor.execute(query)
        except Exception as e:
            print(e)
            return False
        
        self.conn.commit()
        return True 