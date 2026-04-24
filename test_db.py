from db import get_db
import traceback

db_gen = get_db()
db = next(db_gen)

try:
    with db.cursor() as cur:
        cur.execute("SELECT id_usuario, nome, email, ativo, username, senha FROM usuario WHERE email = %s", ("test@test.com",))
        user = cur.fetchone()
        print(user)
except Exception as e:
    traceback.print_exc()

