from fastapi import FastAPI, Request, Depends, HTTPException, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import pymysql
from db import get_db
from datetime import date, time, datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Aurora Streaming API")


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def ok(data):
    """Resposta de sucesso padronizada."""
    return {"data": data, "error": None}


def serialize_row(row):
    """Converte campos date/time/datetime para string."""
    if row is None:
        return None
    out = {}
    for k, v in row.items():
        if isinstance(v, (date, datetime)):
            out[k] = v.isoformat()
        elif isinstance(v, time):
            out[k] = str(v)[:5]  
        elif isinstance(v, timedelta):
            total = int(v.total_seconds())
            h, m, s = total // 3600, (total % 3600) // 60, total % 60
            out[k] = f"{m}:{s:02d}" if h == 0 else f"{h}:{m:02d}:{s:02d}"
        elif isinstance(v, bytes):
            out[k] = None  
        else:
            out[k] = v
    return out


def serialize_list(rows):
    return [serialize_row(r) for r in rows]




@app.get("/", response_class=HTMLResponse)
async def landing(request: Request):
    return templates.TemplateResponse(request=request, name="landingpage.html")

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="login.html")

@app.get("/cadastro", response_class=HTMLResponse)
async def cadastro_page(request: Request):
    return templates.TemplateResponse(request=request, name="cadastro.html")

@app.get("/home", response_class=HTMLResponse)
async def home_page(request: Request):
    return templates.TemplateResponse(request=request, name="homepage.html")

@app.get("/biblioteca", response_class=HTMLResponse)
async def biblioteca_page(request: Request):
    return templates.TemplateResponse(request=request, name="biblioteca.html")

@app.get("/playlist", response_class=HTMLResponse)
async def playlist_page(request: Request):
    return templates.TemplateResponse(request=request, name="playlist.html")

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    return templates.TemplateResponse(request=request, name="admin.html")




@app.post("/api/login")
async def api_login(body: dict = Body(...), db=Depends(get_db)):
    email = body.get("email", "")
    senha_digitada = body.get("senha", "") 
    if not email or not senha_digitada:
        raise HTTPException(400, detail="Email e senha são obrigatórios")
    with db.cursor() as cur:
        cur.execute("SELECT id_usuario, nome, email, ativo, username, senha FROM usuario WHERE email = %s", (email,))
        user = cur.fetchone()
    if not user or not pwd_context.verify(senha_digitada, user["senha"]):
        raise HTTPException(401, detail="Email ou senha incorretos")
    if not user["ativo"]:
        raise HTTPException(403, detail="Conta desativada")
    return ok(serialize_row(user))


@app.post("/api/cadastro")
async def api_cadastro(body: dict = Body(...), db=Depends(get_db)):
    campos = ["nome", "email", "senha", "cpf", "User"]
    for c in campos:
        if not body.get(c):
            raise HTTPException(400, detail=f"Campo '{c}' é obrigatório")
    try:
        with db.cursor() as cur:
            senha_criptografada = pwd_context.hash(body["senha"])
            cur.execute(
                "INSERT INTO usuario (nome, email, senha, cpf, username) VALUES (%s, %s, %s, %s, %s)",
                (body["nome"], body["email"], senha_criptografada, body["cpf"], body["User"])
            )
            db.commit()
            return ok({"id_usuario": cur.lastrowid})
    except pymysql.err.IntegrityError as e:
        if "email" in str(e):
            raise HTTPException(409, detail="Email já cadastrado")
        if "cpf" in str(e):
            raise HTTPException(409, detail="CPF já cadastrado")
        if "username" in str(e):
            raise HTTPException(409, detail="Username já cadastrado")
        raise HTTPException(409, detail=str(e))




@app.get("/api/artistas")
async def listar_artistas(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT a.id_artista, a.nome_artista,
                   COUNT(DISTINCT m.id_musica) as total_musicas,
                   COUNT(DISTINCT al.id_album) as total_albuns
            FROM artista a
            LEFT JOIN musica m ON m.id_artista = a.id_artista
            LEFT JOIN album al ON al.id_artista = a.id_artista
            GROUP BY a.id_artista
            ORDER BY a.nome_artista
        """)
        return ok(serialize_list(cur.fetchall()))


@app.get("/api/artistas/{id}")
async def detalhe_artista(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM artista WHERE id_artista = %s", (id,))
        artista = cur.fetchone()
        if not artista:
            raise HTTPException(404, detail="Artista não encontrado")
        cur.execute("SELECT id_album, nome_album, data_lancamento FROM album WHERE id_artista = %s", (id,))
        artista["albuns"] = serialize_list(cur.fetchall())
        cur.execute("""
            SELECT m.id_musica, m.titulo, m.duracao, m.genero, al.nome_album
            FROM musica m JOIN album al ON al.id_album = m.id_album
            WHERE m.id_artista = %s
        """, (id,))
        artista["musicas"] = serialize_list(cur.fetchall())
    return ok(serialize_row(artista))


@app.post("/api/artistas")
async def criar_artista(body: dict = Body(...), db=Depends(get_db)):
    nome = body.get("nome_artista", "").strip()
    if not nome:
        raise HTTPException(400, detail="Nome do artista é obrigatório")
    with db.cursor() as cur:
        cur.execute("INSERT INTO artista (nome_artista) VALUES (%s)", (nome,))
        db.commit()
        return ok({"id_artista": cur.lastrowid})


@app.put("/api/artistas/{id}")
async def atualizar_artista(id: int, body: dict = Body(...), db=Depends(get_db)):
    nome = body.get("nome_artista", "").strip()
    if not nome:
        raise HTTPException(400, detail="Nome do artista é obrigatório")
    with db.cursor() as cur:
        cur.execute("UPDATE artista SET nome_artista = %s WHERE id_artista = %s", (nome, id))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Artista não encontrado")
        db.commit()
    return ok({"message": "Artista atualizado"})


@app.delete("/api/artistas/{id}")
async def excluir_artista(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM artista WHERE id_artista = %s", (id,))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Artista não encontrado")
        db.commit()
    return ok({"message": "Artista excluído"})



@app.get("/api/albuns")
async def listar_albuns(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT al.id_album, al.nome_album, al.data_lancamento,
                   a.id_artista, a.nome_artista,
                   COUNT(m.id_musica) as total_musicas
            FROM album al
            JOIN artista a ON a.id_artista = al.id_artista
            LEFT JOIN musica m ON m.id_album = al.id_album
            GROUP BY al.id_album
            ORDER BY al.nome_album
        """)
        return ok(serialize_list(cur.fetchall()))


@app.get("/api/albuns/{id}")
async def detalhe_album(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT al.*, a.nome_artista FROM album al
            JOIN artista a ON a.id_artista = al.id_artista
            WHERE al.id_album = %s
        """, (id,))
        album = cur.fetchone()
        if not album:
            raise HTTPException(404, detail="Álbum não encontrado")
        cur.execute("SELECT id_musica, titulo, duracao, genero FROM musica WHERE id_album = %s", (id,))
        album["musicas"] = serialize_list(cur.fetchall())
    return ok(serialize_row(album))


@app.post("/api/albuns")
async def criar_album(body: dict = Body(...), db=Depends(get_db)):
    nome = body.get("nome_album", "").strip()
    id_artista = body.get("id_artista")
    if not nome or not id_artista:
        raise HTTPException(400, detail="nome_album e id_artista são obrigatórios")
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO album (nome_album, data_lancamento, id_artista) VALUES (%s, %s, %s)",
            (nome, body.get("data_lancamento"), id_artista)
        )
        db.commit()
        return ok({"id_album": cur.lastrowid})


@app.put("/api/albuns/{id}")
async def atualizar_album(id: int, body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            UPDATE album SET nome_album = %s, data_lancamento = %s, id_artista = %s
            WHERE id_album = %s
        """, (body.get("nome_album"), body.get("data_lancamento"), body.get("id_artista"), id))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Álbum não encontrado")
        db.commit()
    return ok({"message": "Álbum atualizado"})


@app.delete("/api/albuns/{id}")
async def excluir_album(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM album WHERE id_album = %s", (id,))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Álbum não encontrado")
        db.commit()
    return ok({"message": "Álbum excluído"})



@app.get("/api/musicas")
async def listar_musicas(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT m.id_musica, m.titulo, m.duracao, m.genero,
                   a.id_artista, a.nome_artista,
                   al.id_album, al.nome_album
            FROM musica m
            JOIN artista a ON a.id_artista = m.id_artista
            JOIN album al ON al.id_album = m.id_album
            ORDER BY m.titulo
        """)
        return ok(serialize_list(cur.fetchall()))


@app.get("/api/musicas/{id}")
async def detalhe_musica(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT m.*, a.nome_artista, al.nome_album
            FROM musica m
            JOIN artista a ON a.id_artista = m.id_artista
            JOIN album al ON al.id_album = m.id_album
            WHERE m.id_musica = %s
        """, (id,))
        musica = cur.fetchone()
        if not musica:
            raise HTTPException(404, detail="Música não encontrada")
    return ok(serialize_row(musica))


@app.post("/api/musicas")
async def criar_musica(body: dict = Body(...), db=Depends(get_db)):
    titulo = body.get("titulo", "").strip()
    if not titulo or not body.get("id_artista") or not body.get("id_album"):
        raise HTTPException(400, detail="titulo, id_artista e id_album são obrigatórios")
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO musica (titulo, duracao, genero, id_artista, id_album) VALUES (%s, %s, %s, %s, %s)",
            (titulo, body.get("duracao"), body.get("genero"), body["id_artista"], body["id_album"])
        )
        db.commit()
        return ok({"id_musica": cur.lastrowid})


@app.put("/api/musicas/{id}")
async def atualizar_musica(id: int, body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            UPDATE musica SET titulo=%s, duracao=%s, genero=%s, id_artista=%s, id_album=%s
            WHERE id_musica=%s
        """, (body.get("titulo"), body.get("duracao"), body.get("genero"),
              body.get("id_artista"), body.get("id_album"), id))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Música não encontrada")
        db.commit()
    return ok({"message": "Música atualizada"})


@app.delete("/api/musicas/{id}")
async def excluir_musica(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM musica WHERE id_musica = %s", (id,))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Música não encontrada")
        db.commit()
    return ok({"message": "Música excluída"})



@app.get("/api/usuarios")
async def listar_usuarios(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT id_usuario, nome, email, ativo, cpf, username FROM usuario ORDER BY nome")
        return ok(serialize_list(cur.fetchall()))


@app.get("/api/usuarios/{id}")
async def detalhe_usuario(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT id_usuario, nome, email, ativo, cpf, username FROM usuario WHERE id_usuario = %s", (id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(404, detail="Usuário não encontrado")
        cur.execute("SELECT id_playlist, nome, publica FROM playlist WHERE id_usuario = %s", (id,))
        user["playlists"] = serialize_list(cur.fetchall())
    return ok(serialize_row(user))


@app.post("/api/usuarios")
async def criar_usuario(body: dict = Body(...), db=Depends(get_db)):
    for campo in ["nome", "email", "senha"]:
        if not body.get(campo):
            raise HTTPException(400, detail=f"Campo '{campo}' é obrigatório")
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO usuario (nome, email, senha, cpf, username) VALUES (%s, %s, %s, %s, %s)",
                (body["nome"], body["email"], body["senha"], body.get("cpf"), body.get("User"))
            )
            db.commit()
            return ok({"id_usuario": cur.lastrowid})
    except pymysql.err.IntegrityError as e:
        raise HTTPException(409, detail="Email, CPF ou Username já cadastrado")


@app.put("/api/usuarios/{id}")
async def atualizar_usuario(id: int, body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            UPDATE usuario SET nome=%s, email=%s, cpf=%s, User=%s, ativo=%s
            WHERE id_usuario=%s
        """, (body.get("nome"), body.get("email"), body.get("cpf"),
              body.get("User"), body.get("ativo", 1), id))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Usuário não encontrado")
        db.commit()
    return ok({"message": "Usuário atualizado"})


@app.delete("/api/usuarios/{id}")
async def excluir_usuario(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM usuario WHERE id_usuario = %s", (id,))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Usuário não encontrado")
        db.commit()
    return ok({"message": "Usuário excluído"})




@app.get("/api/playlists")
async def listar_playlists(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT p.id_playlist, p.nome, p.publica, p.id_usuario,
                   u.nome as nome_usuario,
                   COUNT(pm.id_musica) as total_musicas
            FROM playlist p
            JOIN usuario u ON u.id_usuario = p.id_usuario
            LEFT JOIN playlist_contem_musica pm ON pm.id_playlist = p.id_playlist
            GROUP BY p.id_playlist
            ORDER BY p.nome
        """)
        return ok(serialize_list(cur.fetchall()))


@app.get("/api/playlists/{id}")
async def detalhe_playlist(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT p.*, u.nome as nome_usuario
            FROM playlist p JOIN usuario u ON u.id_usuario = p.id_usuario
            WHERE p.id_playlist = %s
        """, (id,))
        pl = cur.fetchone()
        if not pl:
            raise HTTPException(404, detail="Playlist não encontrada")
        cur.execute("""
            SELECT m.id_musica, m.titulo, m.duracao, m.genero,
                   a.nome_artista, al.nome_album
            FROM playlist_contem_musica pm
            JOIN musica m ON m.id_musica = pm.id_musica
            JOIN artista a ON a.id_artista = m.id_artista
            JOIN album al ON al.id_album = m.id_album
            WHERE pm.id_playlist = %s
        """, (id,))
        pl["musicas"] = serialize_list(cur.fetchall())
    return ok(serialize_row(pl))


@app.post("/api/playlists")
async def criar_playlist(body: dict = Body(...), db=Depends(get_db)):
    nome = body.get("nome", "").strip()
    id_usuario = body.get("id_usuario")
    if not nome or not id_usuario:
        raise HTTPException(400, detail="nome e id_usuario são obrigatórios")
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO playlist (nome, publica, id_usuario) VALUES (%s, %s, %s)",
            (nome, body.get("publica", 0), id_usuario)
        )
        db.commit()
        return ok({"id_playlist": cur.lastrowid})


@app.put("/api/playlists/{id}")
async def atualizar_playlist(id: int, body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("UPDATE playlist SET nome=%s, publica=%s WHERE id_playlist=%s",
                    (body.get("nome"), body.get("publica", 0), id))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Playlist não encontrada")
        db.commit()
    return ok({"message": "Playlist atualizada"})


@app.delete("/api/playlists/{id}")
async def excluir_playlist(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM playlist WHERE id_playlist = %s", (id,))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Playlist não encontrada")
        db.commit()
    return ok({"message": "Playlist excluída"})


@app.post("/api/playlists/{id}/musicas")
async def add_musica_playlist(id: int, body: dict = Body(...), db=Depends(get_db)):
    id_musica = body.get("id_musica")
    if not id_musica:
        raise HTTPException(400, detail="id_musica é obrigatório")
    try:
        with db.cursor() as cur:
            cur.execute("INSERT INTO playlist_contem_musica (id_playlist, id_musica) VALUES (%s, %s)", (id, id_musica))
            db.commit()
        return ok({"message": "Música adicionada à playlist"})
    except pymysql.err.IntegrityError:
        raise HTTPException(409, detail="Música já está na playlist")


@app.delete("/api/playlists/{id}/musicas/{id_musica}")
async def remover_musica_playlist(id: int, id_musica: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM playlist_contem_musica WHERE id_playlist=%s AND id_musica=%s", (id, id_musica))
        if cur.rowcount == 0:
            raise HTTPException(404, detail="Música não encontrada na playlist")
        db.commit()
    return ok({"message": "Música removida da playlist"})




@app.get("/api/curtidas/{id_usuario}")
async def listar_curtidas(id_usuario: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT m.id_musica, m.titulo, m.duracao, a.nome_artista, c.data_curtida
            FROM curtida c
            JOIN musica m ON m.id_musica = c.id_musica
            JOIN artista a ON a.id_artista = m.id_artista
            WHERE c.id_usuario = %s
            ORDER BY c.data_curtida DESC
        """, (id_usuario,))
        return ok(serialize_list(cur.fetchall()))


@app.post("/api/curtidas")
async def curtir(body: dict = Body(...), db=Depends(get_db)):
    try:
        with db.cursor() as cur:
            cur.execute("INSERT INTO curtida (id_usuario, id_musica) VALUES (%s, %s)",
                        (body["id_usuario"], body["id_musica"]))
            db.commit()
        return ok({"message": "Música curtida"})
    except pymysql.err.IntegrityError:
        raise HTTPException(409, detail="Já curtida")


@app.delete("/api/curtidas/{id_usuario}/{id_musica}")
async def descurtir(id_usuario: int, id_musica: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM curtida WHERE id_usuario=%s AND id_musica=%s", (id_usuario, id_musica))
        db.commit()
    return ok({"message": "Curtida removida"})



@app.get("/api/historico/{id_usuario}")
async def listar_historico(id_usuario: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT h.id, m.id_musica, m.titulo, m.duracao, a.nome_artista, h.data_reproducao
            FROM historico_reproducao h
            JOIN musica m ON m.id_musica = h.id_musica
            JOIN artista a ON a.id_artista = m.id_artista
            WHERE h.id_usuario = %s
            ORDER BY h.data_reproducao DESC
            LIMIT 50
        """, (id_usuario,))
        return ok(serialize_list(cur.fetchall()))


@app.post("/api/historico")
async def registrar_reproducao(body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("INSERT INTO historico_reproducao (id_usuario, id_musica) VALUES (%s, %s)",
                    (body["id_usuario"], body["id_musica"]))
        db.commit()
    return ok({"message": "Reprodução registrada"})




@app.get("/api/dashboard")
async def dashboard(db=Depends(get_db)):
    with db.cursor() as cur:
        stats = {}
        for t, label in [("musica","musicas"),("artista","artistas"),
                         ("playlist","playlists"),("usuario","usuarios")]:
            cur.execute(f"SELECT COUNT(*) as total FROM {t}")
            stats[label] = cur.fetchone()["total"]
        return ok(stats)