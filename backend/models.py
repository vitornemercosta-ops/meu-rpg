from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

# ============================================================
# MODELOS
# ============================================================

class Dragao(db.Model):
    __tablename__ = 'dragoes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    idade = db.Column(db.Integer)
    hp = db.Column(db.Integer, nullable=False)
    sopro = db.Column(db.String(200))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Jogador(db.Model):
    __tablename__ = 'jogadores'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    classe = db.Column(db.String(50))
    raca = db.Column(db.String(50))
    nivel = db.Column(db.Integer)
    hp = db.Column(db.Integer)
    ca = db.Column(db.Integer)
    forca = db.Column(db.Integer, default=10)
    destreza = db.Column(db.Integer, default=10)
    constituicao = db.Column(db.Integer, default=10)
    inteligencia = db.Column(db.Integer, default=10)
    sabedoria = db.Column(db.Integer, default=10)
    carisma = db.Column(db.Integer, default=10)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Inimigo(db.Model):
    __tablename__ = 'inimigos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50))
    hp = db.Column(db.Integer)
    ca = db.Column(db.Integer)
    ataque = db.Column(db.String(200))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Magia(db.Model):
    __tablename__ = 'magias'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    nivel = db.Column(db.Integer)
    escola = db.Column(db.String(50))
    dano = db.Column(db.String(100))
    descricao = db.Column(db.Text)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Iniciativa(db.Model):
    __tablename__ = 'iniciativa'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    iniciativa = db.Column(db.Integer, nullable=False)
    tipo = db.Column(db.String(50))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class LogSessao(db.Model):
    __tablename__ = 'log'
    id = db.Column(db.Integer, primary_key=True)
    evento = db.Column(db.Text, nullable=False)
    data = db.Column(db.String(50))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}