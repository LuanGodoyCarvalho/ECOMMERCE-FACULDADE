from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

app = Flask(__name__)
CORS(app)

# ── Configuração do banco de dados ──────────────────────────────────────────
DB_CONFIG = {
    'host':     'ecommerceserverunicuritiba-ecommerceunicuritiba.l.aivencloud.com',
    'port':     14942,
    'user':     'avnadmin',
    'password': 'AVNS_gFpNQEKvKJ-A3LAntmQ',  # cole aqui a senha do painel Aiven
    'database': 'defaultdb',
    'ssl_disabled': False              # Aiven exige conexão SSL
}

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


# ── Rotas ────────────────────────────────────────────────────────────────────

@app.route('/produtos', methods=['GET'])
def listar_produtos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT id, nome, preco, imagem FROM produtos ORDER BY criado_em DESC')
    produtos = cursor.fetchall()
    cursor.close()
    conn.close()

    # Converte Decimal para float e bytes para string (necessário para JSON)
    for p in produtos:
        p['preco'] = float(p['preco'])
        if isinstance(p.get('imagem'), bytes):
            p['imagem'] = p['imagem'].decode('utf-8')

    return jsonify(produtos)


@app.route('/produtos', methods=['POST'])
def cadastrar_produto():
    data = request.get_json()

    nome   = data.get('nome', '').strip()
    preco  = data.get('preco')
    imagem = data.get('imagem', '')

    if not nome or preco is None:
        return jsonify({'erro': 'Nome e preco sao obrigatorios'}), 400

    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO produtos (nome, preco, imagem) VALUES (%s, %s, %s)',
        (nome, float(preco), imagem)
    )
    conn.commit()
    produto_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({'id': produto_id, 'mensagem': 'Produto cadastrado com sucesso'}), 201


@app.route('/produtos/nome/<string:nome>', methods=['DELETE'])
def remover_produto_por_nome(nome):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM produtos WHERE LOWER(nome) = LOWER(%s)', (nome,))
    conn.commit()
    afetados = cursor.rowcount
    cursor.close()
    conn.close()

    if afetados == 0:
        return jsonify({'erro': 'Produto nao encontrado'}), 404

    return jsonify({'mensagem': 'Produto removido com sucesso'})


@app.route('/produtos/<int:produto_id>', methods=['DELETE'])
def remover_produto_por_id(produto_id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM produtos WHERE id = %s', (produto_id,))
    conn.commit()
    afetados = cursor.rowcount
    cursor.close()
    conn.close()

    if afetados == 0:
        return jsonify({'erro': 'Produto nao encontrado'}), 404

    return jsonify({'mensagem': 'Produto removido com sucesso'})



# ── Usuários ─────────────────────────────────────────────────────────────────

@app.route('/usuarios/cadastro', methods=['POST'])
def cadastrar_usuario():
    data  = request.get_json()
    email = (data.get('email') or '').strip().lower()
    senha = (data.get('senha') or '').strip()
    tipo  = (data.get('tipo') or 'cliente').strip().lower()

    if not email or not senha:
        return jsonify({'erro': 'Email e senha sao obrigatorios'}), 400

    if tipo not in ('cliente', 'vendedor'):
        return jsonify({'erro': 'Tipo invalido. Use "cliente" ou "vendedor"'}), 400

    senha_hash = generate_password_hash(senha)

    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO usuarios (email, senha, tipo) VALUES (%s, %s, %s)',
            (email, senha_hash, tipo)
        )
        conn.commit()
        usuario_id = cursor.lastrowid
        cursor.close()
        conn.close()
    except mysql.connector.IntegrityError:
        return jsonify({'erro': 'Este email ja esta cadastrado'}), 409
    finally:
        try:
            cursor.close()
            conn.close()
        except Exception:
            pass

    return jsonify({'id': usuario_id, 'email': email, 'tipo': tipo, 'mensagem': 'Cadastro realizado com sucesso'}), 201


@app.route('/usuarios/login', methods=['POST'])
def login_usuario():
    data  = request.get_json()
    email = (data.get('email') or '').strip().lower()
    senha = (data.get('senha') or '').strip()

    if not email or not senha:
        return jsonify({'erro': 'Email e senha sao obrigatorios'}), 400

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT id, email, senha, tipo FROM usuarios WHERE email = %s', (email,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario or not check_password_hash(usuario['senha'], senha):
        return jsonify({'erro': 'Email ou senha incorretos'}), 401

    return jsonify({'id': usuario['id'], 'email': usuario['email'], 'tipo': usuario['tipo'], 'mensagem': 'Login realizado com sucesso'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
