# 📂 Gestão de Documentos

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

> Uma aplicação fullstack simples e eficiente para upload, visualização e gestão de documentos (PDF, PNG, JPG) com sistema de comentários integrado.

---

## ✨ Funcionalidades

- **Upload de Arquivos:** Suporte para envio de documentos `.pdf`, `.png` e `.jpg`.
- **Visualização & Download:** Permite visualizar arquivos no navegador ou baixá-los diretamente.
- **Comentários:** Sistema de feedback onde usuários podem adicionar notas a cada documento.
- **Interface Intuitiva:** Frontend limpo e responsivo utilizando HTML, CSS e JS puro.

---

## 🛠 Tecnologias Utilizadas

- **Backend:** Python, Flask, SQLAlchemy (SQLite).
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Infraestrutura:** Docker (Containerização), Render (Backend Cloud), Vercel (Frontend Cloud).

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Desktop instalados.

### Executando a Aplicação

Execute o seguinte comando no terminal (na raiz do projeto) para subir os containers:

```bash
docker-compose up --build
```

---

## 🔗 Acesso à Aplicação

Após o terminal confirmar que os containers estão rodando, utilize os links abaixo para acessar o sistema:

### 🏠 Localhost (Rodando na sua máquina)

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:8080` | Interface Visual (HTML) |
| **Backend** | `http://localhost:5000` | API do Servidor (Flask) |

---

### ☁️ Hospedagem na Nuvem (Deploy)

A aplicação também está disponível nos seguintes links de produção:

* **Aplicação (Full-Stack):** [Acessar via Vercel](https://doc-manager-robertoneto.vercel.app/)

### ⚠️ Cuidado com a persistência de Dados (Render)

Por ter sido utilizado o armazenamento local dos arquivos (utilização do SQLite que é um arquivo db local), o render quando inutilizado por mais de 15 minutos vai fazer um shutdown e reinicia tudo que foi criado.
Desta maneira todos os arquivos e informações persistidas no banco de dados são perdidas quando ele reinicia. Dessa forma cuidado em não deixar o backend inativo para não perder seus documentos.
