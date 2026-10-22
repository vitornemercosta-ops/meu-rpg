from flask import Flask, jsonify, request
from flask_cors import CORS
from marshmallow import ValidationError
from datetime import datetime
import os

from models import (
    db, Dragao, Jogador, Inimigo, Magia, Iniciativa, LogSessao
)

from schemas import SCHEMAS

# ============================================================
# MAPA CATEGORIA → MODEL
# (definido ANTES de qualquer função que o use)
# ============================================================
MODELS = {
    'dragoes': Dragao,
    'jogadores': Jogador,
    'inimigos': Inimigo,
    'magias': Magia,
    'iniciativa': Iniciativa,
    'log': LogSessao,
}

# ============================================================
# APP FLASK
# ============================================================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "dnd.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_AS_ASCII'] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)

with app.app_context():
    db.create_all()
    print('✅ Banco criado/verificado em dnd.db')


# ============================================================
# HELPERS
# ============================================================
def get_schema_and_model(categoria):
    """Retorna (schema_cls, model) ou (None, None) se categoria inválida."""
    if categoria not in SCHEMAS or categoria not in MODELS:
        return None, None
    schema_cls, _ = SCHEMAS[categoria]
    return schema_cls, MODELS[categoria]


# ============================================================
# ROTAS GENÉRICAS
# ============================================================
@app.route('/api/<categoria>', methods=['GET'])
def listar(categoria):
    schema_cls, model = get_schema_and_model(categoria)
    if model is None:
        return jsonify({'erro': 'Categoria inválida'}), 404

    items = model.query.all()
    return jsonify([i.to_dict() for i in items])


@app.route('/api/<categoria>', methods=['POST'])
def criar(categoria):
    schema_cls, model = get_schema_and_model(categoria)
    if model is None or schema_cls is None:
        return jsonify({'erro': 'Categoria inválida'}), 404

    schema = schema_cls()
    try:
        dados = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    if categoria == 'log' and not dados.get('data'):
        dados['data'] = datetime.now().strftime('%d/%m/%Y, %H:%M:%S')

    obj = model(**dados)
    db.session.add(obj)
    db.session.commit()
    return jsonify(obj.to_dict()), 201


@app.route('/api/<categoria>/<int:item_id>', methods=['PUT'])
def atualizar(categoria, item_id):
    schema_cls, model = get_schema_and_model(categoria)
    if model is None or schema_cls is None:
        return jsonify({'erro': 'Categoria inválida'}), 404

    obj = model.query.get(item_id)
    if not obj:
        return jsonify({'erro': 'Registro não encontrado'}), 404

    schema = schema_cls(partial=True)
    try:
        dados = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    for k, v in dados.items():
        setattr(obj, k, v)
    db.session.commit()
    return jsonify(obj.to_dict())


@app.route('/api/<categoria>/<int:item_id>', methods=['DELETE'])
def excluir(categoria, item_id):
    schema_cls, model = get_schema_and_model(categoria)
    if model is None:
        return jsonify({'erro': 'Categoria inválida'}), 404

    obj = model.query.get(item_id)
    if not obj:
        return jsonify({'erro': 'Registro não encontrado'}), 404

    db.session.delete(obj)
    db.session.commit()
    return jsonify({'ok': True})


# ============================================================
# HEALTH CHECK
# ============================================================
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'servico': 'Grimório do Mestre API'})


# ============================================================
# INICIALIZAÇÃO
# ============================================================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))