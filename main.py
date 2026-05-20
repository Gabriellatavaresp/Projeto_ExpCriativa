from fastapi import FastAPI, Request, Depends, HTTPException, Body, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import pymysql
import httpx
import base64
from db import get_db
from datetime import date, time, datetime, timedelta
from passlib.context import CryptContext
from starlette.middleware.sessions import SessionMiddleware
import init_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Aurora Streaming API")

@app.on_event("startup")
async def startup_event():
    init_db.init_if_empty()

app.add_middleware(
    SessionMiddleware,
    secret_key="aurora_secret_key",
    session_cookie="aurora_session",
    max_age=300,  # 30 minutos no servidor; JS controla o timeout de 1 min
    same_site="lax",
    https_only=False
)

from starlette.middleware.base import BaseHTTPMiddleware

class RenovarSessaoMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if "session" in request.scope and request.session.get("user_logged_in"):
            request.session["last_activity"] = datetime.now().isoformat()
        response = await call_next(request)
        return response

app.add_middleware(RenovarSessaoMiddleware)


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
async def home_page(request: Request, db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    with db.cursor() as cur:
        cur.execute("""
            SELECT p.id_playlist, p.nome, COUNT(pm.id_musica) as total
            FROM playlist p
            LEFT JOIN playlist_contem_musica pm ON pm.id_playlist = p.id_playlist
            GROUP BY p.id_playlist
            ORDER BY p.nome
            LIMIT 10
        """)
        playlists = serialize_list(cur.fetchall())
        
        cur.execute("""
            SELECT m.id_musica, m.titulo, m.duracao, a.nome_artista
            FROM musica m
            JOIN artista a ON a.id_artista = m.id_artista
            ORDER BY m.titulo
            LIMIT 20
        """)
        musicas_recentes = serialize_list(cur.fetchall())
        
        cur.execute("""
            SELECT id_artista, nome_artista
            FROM artista
            ORDER BY nome_artista
            LIMIT 10
        """)
        artistas = serialize_list(cur.fetchall())
    
    return templates.TemplateResponse(
        request=request, 
        name="homepage.html",
        context={
            "playlists": playlists,
            "musicas_recentes": musicas_recentes,
            "artistas": artistas
        }
    )

@app.get("/biblioteca", response_class=HTMLResponse)
async def biblioteca_page(request: Request, db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    with db.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT m.id_musica, m.titulo, m.duracao, m.genero, a.nome_artista, al.nome_album
            FROM musica m
            JOIN artista a ON a.id_artista = m.id_artista
            JOIN album al ON al.id_album = m.id_album
            ORDER BY m.titulo
        """)
        musicas = serialize_list(cur.fetchall())
        
        cur.execute("""
            SELECT id_artista, nome_artista
            FROM artista
            ORDER BY nome_artista
        """)
        artistas = serialize_list(cur.fetchall())
    
    return templates.TemplateResponse(
        request=request,
        name="biblioteca.html",
        context={
            "musicas": musicas,
            "artistas": artistas
        }
    )

@app.get("/perfil", response_class=HTMLResponse)
async def perfil_page(request: Request):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    return templates.TemplateResponse(request=request, name="perfil.html")

@app.put("/api/usuarios/{id}/senha")
async def alterar_senha(id: int, request: Request, body: dict = Body(...), db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Não autenticado")
    if request.session.get("id_usuario") != id and request.session.get("perfil") != "admin":
        raise HTTPException(403, detail="Sem permissão")
    senha = body.get("senha", "")
    if len(senha) < 8:
        raise HTTPException(400, detail="Senha muito curta")
    with db.cursor() as cur:
        cur.execute("UPDATE usuario SET senha=%s WHERE id_usuario=%s",
                    (pwd_context.hash(senha[:72]), id))
        db.commit()
    return ok({"message": "Senha alterada"})

@app.get("/curtidas", response_class=HTMLResponse)
async def curtidas_page(request: Request):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    return templates.TemplateResponse(request=request, name="curtidas.html")

@app.get("/playlist", response_class=HTMLResponse)
async def playlist_page(request: Request, db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    with db.cursor() as cur:
        cur.execute("""
            SELECT p.id_playlist, p.nome, p.publica, COUNT(pm.id_musica) as total_musicas
            FROM playlist p
            LEFT JOIN playlist_contem_musica pm ON pm.id_playlist = p.id_playlist
            GROUP BY p.id_playlist
            ORDER BY p.nome
        """)
        playlists = serialize_list(cur.fetchall())
    
    return templates.TemplateResponse(
        request=request,
        name="playlist.html",
        context={"playlists": playlists}
    )

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request, db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    if request.session.get("perfil") != "admin":
        return RedirectResponse(url="/home", status_code=302)
    request.session["_ts"] = datetime.now().isoformat()
    with db.cursor() as cur:
        stats = {}
        for t, label in [("musica", "musicas"), ("artista", "artistas"),
                         ("playlist", "playlists"), ("usuario", "usuarios")]:
            cur.execute(f"SELECT COUNT(*) as total FROM {t}")
            stats[label] = cur.fetchone()["total"]
    return templates.TemplateResponse(request=request, name="admin.html", context={"active": "dashboard", "stats": stats})

@app.get("/admin/musicas", response_class=HTMLResponse)
async def admin_musicas(request: Request):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    if request.session.get("perfil") != "admin":
        return RedirectResponse(url="/home", status_code=302)
    request.session["_ts"] = datetime.now().isoformat()
    return templates.TemplateResponse(request=request, name="admin_musicas.html", context={"active": "musicas"})

@app.get("/admin/artistas", response_class=HTMLResponse)
async def admin_artistas(request: Request):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    if request.session.get("perfil") != "admin":
        return RedirectResponse(url="/home", status_code=302)
    request.session["_ts"] = datetime.now().isoformat()
    return templates.TemplateResponse(request=request, name="admin_artistas.html", context={"active": "artistas"})

@app.get("/admin/albuns", response_class=HTMLResponse)
async def admin_albuns(request: Request):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    if request.session.get("perfil") != "admin":
        return RedirectResponse(url="/home", status_code=302)
    request.session["_ts"] = datetime.now().isoformat()
    return templates.TemplateResponse(request=request, name="admin_albuns.html", context={"active": "albuns"})

@app.get("/admin/playlists", response_class=HTMLResponse)
async def admin_playlists(request: Request):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    if request.session.get("perfil") != "admin":
        return RedirectResponse(url="/home", status_code=302)
    request.session["_ts"] = datetime.now().isoformat()
    return templates.TemplateResponse(request=request, name="admin_playlists.html", context={"active": "playlists"})

@app.get("/admin/usuarios", response_class=HTMLResponse)
async def admin_usuarios(request: Request):
    if not request.session.get("user_logged_in"):
        return RedirectResponse(url="/login", status_code=302)
    if request.session.get("perfil") != "admin":
        return RedirectResponse(url="/home", status_code=302)
    request.session["_ts"] = datetime.now().isoformat()
    return templates.TemplateResponse(request=request, name="admin_usuarios.html", context={"active": "usuarios"})
@app.get("/api/check-session")
async def check_session(request: Request):
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Sessão expirada")
    return ok({"status": "ok"})

@app.post("/api/session/heartbeat")
async def session_heartbeat(request: Request):
    """Renova a sessão enquanto o usuário está ativo."""
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Sessão expirada")
    request.session["last_activity"] = datetime.now().isoformat()
    return ok({"status": "renewed"})

@app.get("/api/me")
async def get_me(request: Request, db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Não autenticado")
    id_usuario = request.session.get("id_usuario")
    with db.cursor() as cur:
        cur.execute(
            "SELECT id_usuario, nome, email, username, cpf, is_admin, foto_perfil FROM usuario WHERE id_usuario = %s",
            (id_usuario,)
        )
        user = cur.fetchone()
    if not user:
        raise HTTPException(404, detail="Usuário não encontrado")
    foto_b64 = None
    if user.get("foto_perfil"):
        foto_b64 = "data:image/jpeg;base64," + base64.b64encode(user["foto_perfil"]).decode()
    return ok({
        "id_usuario": user["id_usuario"],
        "nome": user["nome"],
        "email": user["email"],
        "username": user["username"],
        "cpf": user["cpf"],
        "is_admin": user["is_admin"],
        "foto_perfil": foto_b64,
    })

@app.post("/api/me/foto")
async def upload_foto(request: Request, foto: UploadFile = File(...), db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Não autenticado")
    id_usuario = request.session.get("id_usuario")
    conteudo = await foto.read()
    if len(conteudo) > 5 * 1024 * 1024:
        raise HTTPException(400, detail="Imagem muito grande (máx 5MB)")
    with db.cursor() as cur:
        cur.execute("UPDATE usuario SET foto_perfil = %s WHERE id_usuario = %s", (conteudo, id_usuario))
        db.commit()
    foto_b64 = "data:image/jpeg;base64," + base64.b64encode(conteudo).decode()
    return ok({"foto_perfil": foto_b64})

@app.get("/api/playlists/minhas")
async def minhas_playlists(request: Request, db=Depends(get_db)):
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Não autenticado")
    id_usuario = request.session.get("id_usuario")
    with db.cursor() as cur:
        cur.execute("""
            SELECT p.id_playlist, p.nome, p.publica, p.cor, p.data_criacao,
                   COUNT(pm.id_musica) as total_musicas
            FROM playlist p
            LEFT JOIN playlist_contem_musica pm ON pm.id_playlist = p.id_playlist
            WHERE p.id_usuario = %s
            GROUP BY p.id_playlist
            ORDER BY p.data_criacao DESC
        """, (id_usuario,))
        playlists = serialize_list(cur.fetchall())
    return ok(playlists)

@app.get("/api/deezer/search")
async def deezer_search(q: str, limit: int = 10):
    """Proxy para a API pública do Deezer (evita CORS no browser)."""
    if not q or len(q.strip()) < 2:
        return ok([])
    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            r = await client.get(
                "https://api.deezer.com/search/track",
                params={"q": q, "limit": min(limit, 25)}
            )
            data = r.json()
            tracks = []
            for t in data.get("data", []):
                dur_sec = t.get("duration", 0)
                m, s = divmod(dur_sec, 60)
                h, m = divmod(m, 60)
                duracao_str = f"{h:02d}:{m:02d}:{s:02d}"
                tracks.append({
                    "deezer_id":   t["id"],
                    "titulo":      t["title"],
                    "artista":     t["artist"]["name"],
                    "album":       t["album"]["title"],
                    "duracao_seg": dur_sec,
                    "duracao":     duracao_str,
                    "preview_url": t.get("preview"),
                    "capa":        t["album"].get("cover_medium"),
                })
            return ok(tracks)
        except Exception as e:
            raise HTTPException(502, detail=f"Erro ao consultar Deezer: {str(e)}")

@app.post("/api/login")
async def api_login(request: Request, body: dict = Body(...), db=Depends(get_db)):
    email = body.get("email", "")
    senha = body.get("senha", "")

    with db.cursor() as cur:
        cur.execute("SELECT id_usuario, nome, email, ativo, username AS User, senha, is_admin FROM usuario WHERE email = %s", (email,))
        user = cur.fetchone()

    if not user or not pwd_context.verify(str(senha)[:72], user["senha"]):
        raise HTTPException(401, detail="Email ou senha incorretos")
    if not user["ativo"]:
        raise HTTPException(403, detail="Conta desativada")

    request.session["user_logged_in"] = True
    request.session["nome_usuario"] = user["nome"]
    request.session["perfil"] = "admin" if user["is_admin"] else "usuario"
    request.session["id_usuario"] = user["id_usuario"]

    return ok(serialize_row(user))

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=302)

@app.post("/api/cadastro")
async def api_cadastro(body: dict = Body(...), db=Depends(get_db)):
    campos = ["nome", "email", "senha", "cpf", "User"]
    for c in campos:
        if not body.get(c):
            raise HTTPException(400, detail=f"Campo '{c}' é obrigatório")
    try:
        with db.cursor() as cur:
            senha_str = str(body["senha"])[:72]
            senha_criptografada = pwd_context.hash(senha_str)
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
                   m.preview_url, m.deezer_id,
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
    for campo in ["titulo", "id_artista", "id_album"]:
        if not body.get(campo):
            raise HTTPException(400, detail=f"Campo '{campo}' é obrigatório")
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO musica (titulo, duracao, genero, id_artista, id_album, preview_url, deezer_id) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (body["titulo"], body.get("duracao"), body.get("genero"),
                 body["id_artista"], body["id_album"],
                 body.get("preview_url"), body.get("deezer_id"))
            )
            db.commit()
            return ok({"id_musica": cur.lastrowid})
    except pymysql.err.IntegrityError:
        raise HTTPException(409, detail="Música já cadastrada ou dados inválidos")


@app.put("/api/musicas/{id}")
async def atualizar_musica(id: int, body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            UPDATE musica SET titulo=%s, duracao=%s, genero=%s, id_artista=%s, id_album=%s, preview_url=%s, deezer_id=%s
            WHERE id_musica=%s
        """, (body.get("titulo"), body.get("duracao"), body.get("genero"),
              body.get("id_artista"), body.get("id_album"),
              body.get("preview_url"), body.get("deezer_id"), id))
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
        cur.execute("SELECT id_usuario, nome, email, ativo, cpf, username AS User FROM usuario ORDER BY nome")
        return ok(serialize_list(cur.fetchall()))


@app.get("/api/usuarios/{id}")
async def detalhe_usuario(id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT id_usuario, nome, email, ativo, cpf, username AS User FROM usuario WHERE id_usuario = %s", (id,))
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
            senha_str = str(body["senha"])[:72]
            senha_criptografada = pwd_context.hash(senha_str)
            cur.execute(
                "INSERT INTO usuario (nome, email, senha, cpf, username) VALUES (%s, %s, %s, %s, %s)",
                (body["nome"], body["email"], senha_criptografada, body.get("cpf"), body.get("User"))
            )
            db.commit()
            return ok({"id_usuario": cur.lastrowid})
    except pymysql.err.IntegrityError as e:
        raise HTTPException(409, detail="Email, CPF ou Username já cadastrado")


@app.put("/api/usuarios/{id}")
async def atualizar_usuario(id: int, body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            UPDATE usuario SET nome=%s, email=%s, cpf=%s, username=%s, ativo=%s
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


@app.get("/api/playlists/admin/salvos")
async def admin_salvos(request: Request, db=Depends(get_db)):
    """Retorna IDs das playlists do admin que o usuário logado já salvou."""
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Não autenticado")
    id_usuario = request.session.get("id_usuario")
    with db.cursor() as cur:
        cur.execute("""
            SELECT source_playlist_id FROM playlist
            WHERE id_usuario = %s AND source_playlist_id IS NOT NULL
        """, (id_usuario,))
        ids = [row["source_playlist_id"] for row in cur.fetchall()]
    return ok(ids)


@app.get("/api/playlists/admin")
async def playlists_admin(request: Request, db=Depends(get_db)):
    """Retorna playlists públicas criadas por admins."""
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Não autenticado")
    with db.cursor() as cur:
        cur.execute("""
            SELECT p.id_playlist, p.nome, p.publica, p.cor, p.data_criacao,
                   COUNT(pm.id_musica) as total_musicas
            FROM playlist p
            JOIN usuario u ON u.id_usuario = p.id_usuario
            LEFT JOIN playlist_contem_musica pm ON pm.id_playlist = p.id_playlist
            WHERE u.is_admin = 1 AND p.publica = 1
            GROUP BY p.id_playlist
            ORDER BY p.data_criacao DESC
        """)
        playlists = serialize_list(cur.fetchall())
    return ok(playlists)


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
                   m.preview_url, m.deezer_id,
                   a.nome_artista, al.nome_album
            FROM playlist_contem_musica pm
            JOIN musica m ON m.id_musica = pm.id_musica
            JOIN artista a ON a.id_artista = m.id_artista
            JOIN album al ON al.id_album = m.id_album
            WHERE pm.id_playlist = %s
        """, (id,))
        pl["musicas"] = serialize_list(cur.fetchall())
    return ok(serialize_row(pl))


@app.post("/api/playlists/{id}/salvar")
async def salvar_playlist_admin(id: int, request: Request, db=Depends(get_db)):
    """Copia uma playlist do admin para a biblioteca do usuário logado."""
    if not request.session.get("user_logged_in"):
        raise HTTPException(401, detail="Não autenticado")
    id_usuario = request.session.get("id_usuario")
    with db.cursor() as cur:
        cur.execute("SELECT nome, cor FROM playlist WHERE id_playlist = %s", (id,))
        original = cur.fetchone()
        if not original:
            raise HTTPException(404, detail="Playlist não encontrada")
        nome_copia = f"{original['nome']} (salva)"
        cur.execute(
            "INSERT INTO playlist (nome, publica, id_usuario, cor, source_playlist_id) VALUES (%s, 0, %s, %s, %s)",
            (nome_copia, id_usuario, original['cor'], id)
        )
        nova_id = cur.lastrowid
        cur.execute("""
            INSERT INTO playlist_contem_musica (id_playlist, id_musica)
            SELECT %s, id_musica FROM playlist_contem_musica WHERE id_playlist = %s
        """, (nova_id, id))
        db.commit()
    return ok({"id_playlist": nova_id, "message": "Playlist salva na sua biblioteca!"})


@app.post("/api/playlists")
async def criar_playlist(request: Request, body: dict = Body(...), db=Depends(get_db)):
    nome = body.get("nome", "").strip()
    # usa id_usuario do body (admin) ou da sessão (usuário normal)
    id_usuario = body.get("id_usuario") or request.session.get("id_usuario")
    if not nome or not id_usuario:
        raise HTTPException(400, detail="nome é obrigatório e usuário deve estar logado")
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO playlist (nome, publica, id_usuario, cor) VALUES (%s, %s, %s, %s)",
            (nome, body.get("publica", 0), id_usuario, body.get("cor", "#8ab8a8"))
        )
        db.commit()
        return ok({"id_playlist": cur.lastrowid})


@app.put("/api/playlists/{id}")
async def atualizar_playlist(id: int, body: dict = Body(...), db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("UPDATE playlist SET nome=%s, publica=%s, cor=%s WHERE id_playlist=%s",
                    (body.get("nome"), body.get("publica", 0), body.get("cor", "#8ab8a8"), id))
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
            SELECT m.id_musica, m.titulo, m.duracao, m.preview_url,
                   a.nome_artista, c.data_curtida
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
            SELECT h.id, m.id_musica, m.titulo, m.duracao, m.preview_url,
                   a.nome_artista, h.data_reproducao
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