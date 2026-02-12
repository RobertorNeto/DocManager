import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename 
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import func

load_dotenv()
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads' 
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gestao_documentos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)
db = SQLAlchemy(app)

class Documentos(db.Model):
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    titulo = db.Column(db.String(100),nullable=False)
    descricao = db.Column(db.Text)
    data_upload = db.Column(db.DateTime, server_default=func.now())
    nome_arquivo = db.Column(db.Text)
    caminho_arquivo = db.Column(db.Text)

    comentarios_rel = db.relationship('Comentarios', backref='documento', lazy=True)

class Comentarios(db.Model):
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    texto = db.Column(db.Text)
    data_comentario = db.Column(db.DateTime, server_default=func.now())
    documento_id = db.Column(db.Integer, db.ForeignKey('documentos.id'), nullable=False)

@app.route('/upload',methods=['POST'])
def upload_arquivo():
    try:

        if 'file' not in request.files:
            return jsonify({'erro': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        titulo = request.form.get('titulo')
        descricao = request.form.get('descricao')

        if file.filename == '':
            return jsonify({'erro': 'Nenhum arquivo selecionado'}), 400
        
        if not titulo:
            return jsonify({'erro': 'Titulo é obrigatório'}), 400

        nome_seguro = secure_filename(file.filename)
        nome_salvo = f"{int(datetime.now().timestamp())}_{nome_seguro}"
        caminho = os.path.join(app.config['UPLOAD_FOLDER'], nome_salvo)
        file.save(caminho)

        novo_documento = Documentos(
            titulo=titulo,
            descricao=descricao,
            nome_arquivo=file.filename,
            caminho_arquivo=nome_salvo
        )

        db.session.add(novo_documento)
        db.session.commit()

        return jsonify({
                'mensagem': 'Upload realizado com sucesso!',
                'documento': {
                    'id': novo_documento.id,
                    'titulo': novo_documento.titulo,
                    'arquivo': novo_documento.nome_arquivo
                }
            }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f"Erro: {str(e)}"}), 500

@app.route('/documentos',methods=['GET'])
def get_Documentos():
    documentos = Documentos.query.order_by(Documentos.data_upload.desc()).all()
    
    result = []
    for documento in documentos:
        result.append({
            'id':documento.id,
            'titulo':documento.titulo,
            'descricao':documento.descricao,
            'data_upload':documento.data_upload.strftime('%d/%m/%Y %H:%M'),
            'nome_original': documento.nome_arquivo,
            'url_arquivo': f"/uploads/{documento.caminho_arquivo}"
        })
    return jsonify(result)

@app.route('/documentos/<int:id>/comentarios',methods=['GET'])
def get_Comentarios(id):
    comentarios = Comentarios.query.filter_by(documento_id=id).all()

    result = []
    for comentario in comentarios:
        result.append({
            'id':comentario.id,
            'texto':comentario.texto,
            'data_comentario':comentario.data_comentario.strftime('%d/%m/%Y %H:%M'),
            'documento_id':comentario.documento_id
        })
    return jsonify(result)


@app.route('/documentos/<int:id>/comentarios',methods=['POST'])
def post_Comentarios(id):
    try:
        comentario = request.get_json()

        documento = Documentos.query.get(id)

        if not documento:
            return jsonify({'erro': 'Documento não encontrado.'}), 404

        if not comentario or 'texto' not in comentario:
            return jsonify({'erro': 'O campo "texto" é obrigatório no JSON.'}), 400
        
        texto_comentario = comentario['texto']
        
        novo_comentario = Comentarios(
            texto = texto_comentario,
            documento_id = id
        )

        db.session.add(novo_comentario)
        db.session.commit()
        db.session.refresh(novo_comentario)
        return jsonify({
            'mensagem': 'Comentário salvo!',
            'comentario': {
                'id': novo_comentario.id,
                'texto': novo_comentario.texto,
                'data': novo_comentario.data_comentario.strftime('%d/%m/%Y %H:%M')
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f"Erro interno: {str(e)}"}), 500



@app.route('/uploads/<filename>')
def get_arquivo(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/download/<filename>')
def download_arquivo(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)


with app.app_context(): 
    db.create_all() 

if __name__ == "__main__":
    app.run(port=5000,host='localhost',debug=True)