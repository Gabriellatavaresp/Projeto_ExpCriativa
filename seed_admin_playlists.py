"""
seed_admin_playlists.py — Recria as playlists do admin no banco existente.

Execute:  python seed_admin_playlists.py

Apaga todas as playlists do admin e recria com os dados de init_db.py.
Playlists de usuários comuns NÃO são afetadas.
"""

import pymysql
from db import DB_CONFIG
from init_db import PLAYLISTS, PLAYLIST_SONGS


def _get_conn():
    return pymysql.connect(**DB_CONFIG)


def reseed_admin_playlists():
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            # Descobrir id do admin
            cur.execute("SELECT id_usuario FROM usuario WHERE is_admin = 1 ORDER BY id_usuario LIMIT 1")
            row = cur.fetchone()
            if not row:
                print("❌ Nenhum usuário admin encontrado.")
                return
            id_admin = row["id_usuario"]

            # Remover playlists antigas do admin (cascades removem playlist_contem_musica)
            cur.execute("SET FOREIGN_KEY_CHECKS = 0")
            cur.execute("""
                DELETE pcm FROM playlist_contem_musica pcm
                JOIN playlist p ON p.id_playlist = pcm.id_playlist
                WHERE p.id_usuario = %s
            """, (id_admin,))
            cur.execute("DELETE FROM playlist WHERE id_usuario = %s", (id_admin,))
            cur.execute("SET FOREIGN_KEY_CHECKS = 1")
            conn.commit()

            # Buscar IDs das músicas em ordem
            cur.execute("SELECT id_musica FROM musica ORDER BY id_musica")
            ids_mus = [row["id_musica"] for row in cur.fetchall()]

            # Inserir playlists do admin (idx_usuario == 0 no PLAYLISTS)
            admin_playlists = [(i, nome, publica, cor)
                               for i, (nome, publica, idx_usr, cor) in enumerate(PLAYLISTS)
                               if idx_usr == 0]

            inserted = {}
            for original_idx, nome, publica, cor in admin_playlists:
                cur.execute(
                    "INSERT INTO playlist (nome, publica, id_usuario, cor) VALUES (%s,%s,%s,%s)",
                    (nome, publica, id_admin, cor)
                )
                inserted[original_idx] = cur.lastrowid
            conn.commit()

            # Associar músicas
            for original_idx, new_id in inserted.items():
                for s_idx in PLAYLIST_SONGS.get(original_idx, []):
                    if s_idx < len(ids_mus):
                        try:
                            cur.execute(
                                "INSERT INTO playlist_contem_musica (id_playlist, id_musica) VALUES (%s,%s)",
                                (new_id, ids_mus[s_idx])
                            )
                        except Exception:
                            pass
            conn.commit()

        print(f"✅ {len(inserted)} playlists do admin recriadas com sucesso!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    reseed_admin_playlists()
