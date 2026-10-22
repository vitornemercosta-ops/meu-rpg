from marshmallow import Schema, fields, validate, EXCLUDE

# ============================================================
# SCHEMAS DE VALIDAÇÃO
# ============================================================

class DragaoSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    nome = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    tipo = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    idade = fields.Int(required=False, allow_none=True,
                       validate=validate.Range(min=0, max=10000))
    hp = fields.Int(required=True, validate=validate.Range(min=1))
    sopro = fields.Str(required=False, allow_none=True,
                       validate=validate.Length(max=200))


class JogadorSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    nome = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    classe = fields.Str(required=False, allow_none=True)
    raca = fields.Str(required=False, allow_none=True)
    nivel = fields.Int(required=False, allow_none=True,
                       validate=validate.Range(min=1, max=20))
    hp = fields.Int(required=False, allow_none=True, validate=validate.Range(min=0))
    ca = fields.Int(required=False, allow_none=True, validate=validate.Range(min=0))
    forca = fields.Int(required=False, allow_none=True,
                       validate=validate.Range(min=1, max=30))
    destreza = fields.Int(required=False, allow_none=True,
                          validate=validate.Range(min=1, max=30))
    constituicao = fields.Int(required=False, allow_none=True,
                              validate=validate.Range(min=1, max=30))
    inteligencia = fields.Int(required=False, allow_none=True,
                              validate=validate.Range(min=1, max=30))
    sabedoria = fields.Int(required=False, allow_none=True,
                           validate=validate.Range(min=1, max=30))
    carisma = fields.Int(required=False, allow_none=True,
                         validate=validate.Range(min=1, max=30))


class InimigoSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    nome = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    tipo = fields.Str(required=False, allow_none=True)
    hp = fields.Int(required=False, allow_none=True, validate=validate.Range(min=0))
    ca = fields.Int(required=False, allow_none=True, validate=validate.Range(min=0))
    ataque = fields.Str(required=False, allow_none=True)


class MagiaSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    nome = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    nivel = fields.Int(required=False, allow_none=True,
                       validate=validate.Range(min=0, max=9))
    escola = fields.Str(required=False, allow_none=True)
    dano = fields.Str(required=False, allow_none=True)
    descricao = fields.Str(required=False, allow_none=True)


class IniciativaSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    nome = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    iniciativa = fields.Int(required=True)
    tipo = fields.Str(required=False, allow_none=True)


class LogSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    evento = fields.Str(required=True, validate=validate.Length(min=1))
    data = fields.Str(required=False, allow_none=True)


# ============================================================
# MAPA DE SCHEMAS (o model é injetado no app.py)
# ============================================================
SCHEMAS = {
    'dragoes': (DragaoSchema, None),
    'jogadores': (JogadorSchema, None),
    'inimigos': (InimigoSchema, None),
    'magias': (MagiaSchema, None),
    'iniciativa': (IniciativaSchema, None),
    'log': (LogSchema, None),
}