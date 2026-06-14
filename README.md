# Aurora — Plataforma de Streaming Musical

Projeto desenvolvido para a disciplina **Experiência Criativa — 2026.1**.

O **Aurora** é uma aplicação web de streaming musical que permite aos usuários explorar um catálogo de músicas, montar playlists pessoais, curtir faixas favoritas e personalizar seu perfil. Conta também com um painel administrativo completo para gerenciar todo o conteúdo da plataforma.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como executar](#como-executar)
- [Banco de dados](#banco-de-dados)
- [Rotas principais](#rotas-principais)
- [Design](#design)
- [Equipe](#equipe)

---

## Funcionalidades

### Para usuários
- **Cadastro e login** com senha criptografada (bcrypt)
- **Sessão com renovação automática** e expiração por inatividade
- **Homepage** com playlists em destaque
- **Biblioteca** completa de músicas, artistas e álbuns
- **Playlists** com filtro por gênero musical
- **Sistema de curtidas** — músicas favoritas em uma página dedicada
- **Perfil personalizável** — foto, dados pessoais e alteração de senha
- **Player de música** integrado em todas as páginas

### Para administradores
Painel administrativo com **CRUD completo** para:
- Usuários
- Artistas
- Álbuns
- Músicas
- Playlists

Todos os formulários contam com validação de dados, upload de imagens e mensagens claras de feedback.

---

## Tecnologias

| Camada | Stack |
|--------|-------|
| Backend | FastAPI (Python), Uvicorn |
| Banco de dados | MySQL (compatível com Amazon Aurora) |
| ORM / Driver | PyMySQL |
| Templates | Jinja2 |
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Autenticação | Passlib + bcrypt, Starlette SessionMiddleware |
| Outras libs | httpx, python-multipart |

---

## Estrutura do projeto

```
Projeto_ExpCriativa/
├── main.py                  # Aplicação FastAPI (rotas, sessão, APIs)
├── db.py                    # Configuração da conexão com o MySQL
├── init_db.py               # Inicialização automática do banco no startup
├── seed.py                  # Popula o banco com dados de exemplo
├── seed_admin_playlists.py  # Cria playlists padrão de admin
├── requirements.txt         # Dependências Python
├── db/
│   └── BD_Aurora_.sql       # Script SQL do esquema do banco
├── templates/               # Páginas Jinja2
│   ├── landingpage.html
│   ├── login.html
│   ├── cadastro.html
│   ├── homepage.html
│   ├── biblioteca.html
│   ├── playlist.html
│   ├── curtidas.html
│   ├── perfil.html
│   ├── admin.html
│   ├── admin_base.html
│   ├── admin_usuarios.html
│   ├── admin_artistas.html
│   ├── admin_albuns.html
│   ├── admin_musicas.html
│   └── admin_playlists.html
└── static/
    ├── css/                 # Estilos por página
    ├── js/                  # Lógica de frontend por página
    └── script.js
```

---

## Pré-requisitos

- **Python 3.10+**
- **MySQL 8.x** rodando localmente (ou Amazon Aurora MySQL)
- **pip**

---

## Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/Gabriellatavaresp/Projeto_ExpCriativa
cd Projeto_ExpCriativa
```

### 2. Crie um ambiente virtual

```bash
python3 -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate            # Windows
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Configure o banco de dados

Edite `db.py` com as credenciais do seu MySQL:

```python
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "sua_senha",
    "database": "AuroraStreaming",
    "cursorclass": pymysql.cursors.DictCursor,
}
```

> O banco `AuroraStreaming` e todas as tabelas são criados automaticamente no primeiro startup pelo `init_db.py`.

### 5. (Opcional) Popule o banco com dados de exemplo

```bash
python seed.py
python seed_admin_playlists.py
```

### 6. Rode a aplicação

```bash
uvicorn main:app --reload
```

Acesse no navegador: **http://localhost:8000**

---

## Banco de dados

O esquema completo está em [`db/BD_Aurora_.sql`](db/BD_Aurora_.sql). As entidades principais são:

- `usuario` — contas de cliente e admin
- `artista` — artistas do catálogo
- `album` — álbuns vinculados a artistas
- `musica` — músicas, com gênero e duração
- `playlist` — playlists do sistema e dos usuários
- `playlist_contem_musica` — relação N:N entre playlists e músicas
- `usuario_curtiu_musica` — curtidas dos usuários

---

## Rotas principais

### Páginas (HTML)
| Rota | Descrição |
|------|-----------|
| `/` | Landing page pública |
| `/login` | Login de usuário |
| `/cadastro` | Cadastro de novo usuário |
| `/home` | Homepage do usuário autenticado |
| `/biblioteca` | Catálogo completo |
| `/playlist/{id}` | Detalhe de playlist |
| `/curtidas` | Músicas curtidas |
| `/perfil` | Edição de perfil |
| `/admin` | Painel administrativo |

### API (JSON)
Todas as operações CRUD do painel admin são expostas como endpoints REST sob `/api/...`, retornando o formato padronizado `{ "data": ..., "error": ... }`.

A documentação interativa da API fica disponível em:
- **Swagger UI** — http://localhost:8000/docs
- **ReDoc** — http://localhost:8000/redoc

---

## Design

Protótipo de alta fidelidade no Figma:
[Projeto Aurora — Figma](https://www.figma.com/make/Voj4b6S5c93F9ZwldwFyee/High-fidelity-music-app-design?t=YeKh2hTMHmr2pQod-1)

A identidade visual utiliza tema escuro com paleta roxo/ciano/rosa, layout responsivo e foco em uma experiência imersiva de streaming.

---

## Equipe

Projeto desenvolvido por estudantes da PUC — Disciplina de Experiência Criativa (2026.1).
