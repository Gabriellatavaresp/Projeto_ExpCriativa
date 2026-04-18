from fastapi import FastAPI, Request, Form, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import pymysql
from db import get_db

app = FastAPI()

# Configura as pastas do seu projeto
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ROTA 1: Carregar o Painel e listar os usuários do MySQL
@app.get("/admin", response_class=HTMLResponse)
async def painel_admin(request: Request, db=Depends(get_db)):
    with db.cursor(pymysql.cursors.DictCursor) as cursor:
        # Busca os usuários no banco
        cursor.execute("SELECT id_usuario, nome, email, cpf, ativo FROM usuario ORDER BY nome")
        lista_usuarios = cursor.fetchall()
    
    return templates.TemplateResponse(
            request=request, 
            name="admin.html", 
            context={"usuarios": lista_usuarios}
        )

# ROTA 2: Receber os dados do formulário (Modal) e salvar no banco
@app.post("/admin/usuario/adicionar")
async def adicionar_usuario(
    nome: str = Form(...),
    email: str = Form(...),
    senha: str = Form(...),
    cpf: str = Form(...),
    db=Depends(get_db)
):
    try:
        with db.cursor() as cursor:
            # Comando de inserção
            sql = "INSERT INTO usuario (nome, email, senha, cpf) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (nome, email, senha, cpf))
            db.commit()
    except Exception as e:
        print(f"Erro ao salvar: {e}")
        # Futuramente podemos colocar um alerta de erro aqui
        
    # Recarrega a página do painel
    return RedirectResponse(url="/admin", status_code=303)

# ROTA 3: Excluir usuário
@app.post("/admin/usuario/excluir/{id_usuario}")
async def excluir_usuario(id_usuario: int, db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))
        db.commit()
    return RedirectResponse(url="/admin", status_code=303)

# ROTA 4: Atualizar Usuário (UPDATE)
@app.post("/admin/usuario/editar")
async def editar_usuario(
    id_usuario: int = Form(...), # Recebe o ID daquele input oculto (hidden)
    nome: str = Form(...),
    email: str = Form(...),
    cpf: str = Form(...),
    db=Depends(get_db)
):
    try:
        with db.cursor() as cursor:
            # Comando UPDATE para alterar apenas os dados do usuário específico
            sql = """UPDATE usuario 
                     SET nome = %s, email = %s, cpf = %s 
                     WHERE id_usuario = %s"""
            cursor.execute(sql, (nome, email, cpf, id_usuario))
            db.commit()
    except Exception as e:
        print(f"Erro ao atualizar: {e}")
        
    return RedirectResponse(url="/admin", status_code=303)