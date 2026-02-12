const botaoModal = document.querySelector('.novo-documento');
const modal = document.getElementById('modalUpload');
const btnCancelar = document.getElementById('btnCancelarModal');
const apiUrl = 'https://docmanager-wwx7.onrender.com'

botaoModal.addEventListener('click', function() {
    modal.style.display = "flex"; 
});

function fecharModal() {
    modal.style.display = "none";
    document.getElementById('uploadForm').reset(); 
}

btnCancelar.addEventListener('click', fecharModal);

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        fecharModal();
    }
}); 

function getIcone(nome_arquivo){
    if(nome_arquivo.endsWith('.pdf')){
        return 'icons/document-pdf.svg'
    }else if(nome_arquivo.endsWith('.png')){
        return 'icons/document-png.svg'
    }else{
        return 'icons/document-jpg.svg'
    }
}


function getExtensao(nome_arquivo){
    if(nome_arquivo.endsWith('.pdf')){
        return 'PDF'
    }else if(nome_arquivo.endsWith('.png')){
        return 'PNG'
    }else{
        return 'JPG'
    }
}

function getCorIcone(nome) {
    if (nome.endsWith('.pdf')){
        return '#ffebee';
    }else if (nome.endsWith('.png') || nome.endsWith('.jpg')){
        return '#e3f2fd'; 
    }else{
        return '#f5f5f5'; 
    }
}

async function enviarDocumento() {
    const titulo = document.getElementById('titulo').value
    const descricao = document.getElementById('descricao').value
    const fileinput = document.getElementById('file')
    const file = fileinput.files[0]

    if (!titulo) throw new Error("O título é obrigatório.");
    if (!file) throw new Error("Selecione um arquivo para enviar.");
    
    const formData = new FormData();
    formData.append('titulo',titulo)
    formData.append('file',file)
    if(descricao) formData.append('descricao',descricao)

    try{
        const resposta = await fetch(`${apiUrl}/upload`, {
            method: 'POST',
            body: formData
        })

        if(!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
        const resultado = await resposta.json();
        return resultado

    }catch(error){
        console.error("Falha no envio:", error);
        throw error;
    }
}

async function enviarComentario(id){

    const texto = document.getElementById('textoComentario').value
    if(!texto) throw new Error("O Comentario é obrigatório.");
    const textoJson = JSON.stringify({ "texto" : texto})

    try{
        const resposta = await fetch(`${apiUrl}/documentos/${id}/comentarios`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body : textoJson
        })

        if(!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
        const resultado = await resposta.json();
        return resultado

    }catch(error){
        console.error("Falha no envio:", error);
        throw error;
    }
}

async function carregarDocumentos(){    
    try{
        const resposta = await fetch(`${apiUrl}/documentos`)
        const documentos = await resposta.json();
        const lista = document.getElementById('listaDocumentos');
        lista.innerHTML = '';

        if(documentos.length === 0){
            lista.innerHTML = '<div class="msg-vazio">Nenhum documento encontrado.</div>';
            return
        }

        documentos.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-item';
            const nomeArquivoSalvo = doc.url_arquivo.split('/').pop();

            card.innerHTML = `
                    <div class="doc-logo" style="background-color: ${getCorIcone(doc.nome_original)};"> 
                        <img src="${getIcone(doc.nome_original)}" alt="doc" class="document-icon">
                    </div>

                    <div class="doc-info">
                        <div class="doc-title">${doc.titulo}</div>
                        <div class="doc-meta">
                            ${doc.data_upload} &bull; ${doc.descricao || 'Sem descrição'}
                        </div>
                    </div>

                    <div class="doc-badge">
                        ${getExtensao(doc.nome_original)}
                    </div>

                    <div class="buttons">
                        <a href="${apiUrl}${doc.url_arquivo}" target="_blank" class="btn-visualizar"> <img src="${"icons/eye.svg"}" alt="eye" class="document-icon"></a>
                        <a href="${apiUrl}/download/${nomeArquivoSalvo}" download="${doc.nome_original}"class="btn-visualizar"> <img src="${"icons/download.svg"}" alt="download" class="document-icon"></a>
                        <button class="btn-visualizar btn-comentario-acao"> <img src="${"icons/comment.svg"}" alt="comment" class="document-icon"></button>
                    </div>
            `;
            const btnComentario = card.querySelector('.btn-comentario-acao');
                btnComentario.addEventListener('click', function() {
                    abrirModalComentarios(doc.id);
                });

            lista.appendChild(card);
        });
    }catch (error) {
        console.error("Erro ao listar:", error);
    }
}

async function abrirModalComentarios(id){
    const modal = document.getElementById('modalComentario')
    modal.style.display = "flex"
    modal.dataset.id = id

    function fecharModal(){
        modal.style.display = "none"
        document.getElementById('formComentario').reset(); 
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            fecharModal();
        }
    }); 

    const divLista = document.getElementById('listaComentariosExistentes');
    divLista.innerHTML = '';

    try{
        const resposta = await fetch(`${apiUrl}/documentos/${id}/comentarios`)
        const comentarios = await resposta.json();

        if(comentarios.length === 0){
            divLista.innerHTML = '<div class="msg-vazio">Nenhum Comentario encontrado.</div>';
            return
        }

        comentarios.forEach(c => {
            const card = document.createElement('div');
            card.className = 'com-item';

            card.innerHTML = `
                    <div style="background:#f9f9f9; padding:8px; margin-bottom:5px; border-radius:4px;">
                        <div style="font-size:0.95em;">${c.texto}</div>
                        <div style="font-size:0.75em; color:#999; margin-top:2px;">${c.data_comentario}</div>
                    </div>
            `;
            divLista.appendChild(card)
        })
    }catch (err) {
        divLista.innerHTML = '<p style="color:red">Erro ao carregar.</p>'
    }
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const botaoSalvar = document.querySelector('.btn-salvar');
    const texto = botaoSalvar.textContent;
    botaoSalvar.textContent = 'Enviando...';
    botaoSalvar.disabled = true;

    try {
        await enviarDocumento();
        alert('Sucesso! Documento enviado.');
        fecharModal();      
        carregarDocumentos();
    } catch (erro) {
        alert(erro.message); 
    } finally {
        botaoSalvar.textContent = texto;
        botaoSalvar.disabled = false;
    }
});

document.getElementById('formComentario').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const botaoSalvar = document.querySelector('.btn-salvar');
    const texto = botaoSalvar.textContent;
    botaoSalvar.textContent = 'Enviando...';
    botaoSalvar.disabled = true;

    const modal = document.getElementById('modalComentario')
    const id = modal.dataset.id

    try {
        await enviarComentario(id);
        alert('Sucesso! Documento enviado.');     
        abrirModalComentarios(id)
    } catch (erro) {
        alert(erro.message); 
    } finally {
        botaoSalvar.textContent = texto;
        botaoSalvar.disabled = false;
    }
});

carregarDocumentos()
