CREATE TABLE Korisnik
(
  id_korisnik INT NOT NULL,
  username VARCHAR(20) NOT NULL,
  passwordHash INT NOT NULL,
  fotografija MEDIUMBLOB,
  opis VARCHAR(300),
  lokacija blob NOT NULL,
  email VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_korisnik),
  UNIQUE (email)
);

CREATE TABLE Zanr
(
  id_zanr INT NOT NULL,
  naziv_zanr VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_zanr)
);

CREATE TABLE Igra
(
  naziv VARCHAR(100) NOT NULL,
  id_igra INT NOT NULL,
  izdavac VARCHAR(100) NOT NULL,
  godina_izdanja INT NOT NULL,
  ocjena_ocuvanosti INT NOT NULL,
  broj_igraca INT NOT NULL,
  vrijeme_igranja VARCHAR(15) NOT NULL,
  procjena_tezine INT NOT NULL,
  fotografija MEDIUMBLOB NOT NULL,
  dodatan_opis VARCHAR(500),
  id_zanr INT NOT NULL,
  PRIMARY KEY (id_igra),
  FOREIGN KEY (id_zanr) REFERENCES Zanr(id_zanr)
);

CREATE TABLE interes
(
  id_zanr INT NOT NULL,
  id_korisnik INT NOT NULL,
  PRIMARY KEY (id_zanr, id_korisnik),
  FOREIGN KEY (id_zanr) REFERENCES Zanr(id_zanr),
  FOREIGN KEY (id_korisnik) REFERENCES Korisnik(id_korisnik)
);

CREATE TABLE Ponuda
(
  vrijemeKreiranja INT NOT NULL,
  jeIzvrsena INT NOT NULL,
  id_korisnik INT NOT NULL,
  id_igra INT NOT NULL,
  PRIMARY KEY (id_korisnik, id_igra),
  FOREIGN KEY (id_korisnik) REFERENCES Korisnik(id_korisnik),
  FOREIGN KEY (id_igra) REFERENCES Igra(id_igra)
);

CREATE TABLE ListaZelja
(
  id_igra INT NOT NULL,
  id_korisnik INT NOT NULL,
  FOREIGN KEY (id_igra) REFERENCES Igra(id_igra),
  FOREIGN KEY (id_korisnik) REFERENCES Korisnik(id_korisnik)
);
