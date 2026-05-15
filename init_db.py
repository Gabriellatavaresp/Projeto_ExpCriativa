"""
init_db.py — Inicializa o banco com dados padrão na primeira execução.
Chamado automaticamente no startup do FastAPI. Se o banco já tiver dados,
não faz nada.
"""

import pymysql
from db import DB_CONFIG
from passlib.context import CryptContext
import random

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Dados iniciais ─────────────────────────────────────────────────────────

ARTISTAS = [
    "Queen", "Pink Floyd", "Led Zeppelin", "The Beatles", "Eagles",
    "John Lennon", "David Bowie", "Radiohead", "Daft Punk",
    "Tame Impala", "Arctic Monkeys", "Kendrick Lamar",
]

ALBUNS = [
    ("A Night at the Opera",         "1975-11-21", 0),
    ("News of the World",            "1977-10-28", 0),
    ("The Dark Side of the Moon",    "1973-03-01", 1),
    ("The Wall",                     "1979-11-30", 1),
    ("Led Zeppelin IV",              "1971-11-08", 2),
    ("Abbey Road",                   "1969-09-26", 3),
    ("Hotel California",             "1976-12-08", 4),
    ("Imagine",                      "1971-09-09", 5),
    ("Ziggy Stardust",               "1972-06-16", 6),
    ("OK Computer",                  "1997-05-21", 7),
    ("Kid A",                        "2000-10-02", 7),
    ("Random Access Memories",       "2013-05-17", 8),
    ("Currents",                     "2015-07-17", 9),
    ("AM",                           "2013-09-09", 10),
    ("DAMN.",                        "2017-04-14", 11),
]

MUSICAS = [
    ("Bohemian Rhapsody",                    "00:05:55", "Rock",             0,  0),
    ("Love of My Life",                      "00:03:39", "Balada",           0,  0),
    ("You're My Best Friend",                "00:02:50", "Pop/Rock",         0,  0),
    ("We Will Rock You",                     "00:02:01", "Rock",             0,  1),
    ("We Are the Champions",                 "00:02:59", "Rock",             0,  1),
    ("Spread Your Wings",                    "00:04:34", "Rock",             0,  1),
    ("Money",                                "00:06:22", "Rock Progressivo", 1,  2),
    ("Time",                                 "00:07:06", "Rock Progressivo", 1,  2),
    ("Breathe",                              "00:02:43", "Rock Progressivo", 1,  2),
    ("The Great Gig in the Sky",             "00:04:36", "Rock Progressivo", 1,  2),
    ("Comfortably Numb",                     "00:06:22", "Rock Progressivo", 1,  3),
    ("Another Brick in the Wall",            "00:03:59", "Rock Progressivo", 1,  3),
    ("Hey You",                              "00:04:40", "Rock Progressivo", 1,  3),
    ("Stairway to Heaven",                   "00:08:02", "Rock",             2,  4),
    ("Rock and Roll",                        "00:03:40", "Rock",             2,  4),
    ("Black Dog",                            "00:04:55", "Rock",             2,  4),
    ("Going to California",                  "00:03:31", "Folk Rock",        2,  4),
    ("Come Together",                        "00:04:19", "Rock",             3,  5),
    ("Here Comes the Sun",                   "00:03:05", "Pop",              3,  5),
    ("Something",                            "00:03:02", "Balada",           3,  5),
    ("Octopus's Garden",                     "00:02:51", "Pop",              3,  5),
    ("Hotel California",                     "00:06:30", "Rock",             4,  6),
    ("New Kid in Town",                      "00:05:04", "Rock",             4,  6),
    ("Life in the Fast Lane",                "00:04:46", "Rock",             4,  6),
    ("Imagine",                              "00:03:07", "Pop",              5,  7),
    ("Jealous Guy",                          "00:04:14", "Pop",              5,  7),
    ("Oh My Love",                           "00:02:43", "Balada",           5,  7),
    ("Starman",                              "00:04:10", "Glam Rock",        6,  8),
    ("Ziggy Stardust",                       "00:03:13", "Glam Rock",        6,  8),
    ("Suffragette City",                     "00:03:25", "Glam Rock",        6,  8),
    ("Paranoid Android",                     "00:06:23", "Alternativo",      7,  9),
    ("Karma Police",                         "00:04:21", "Alternativo",      7,  9),
    ("No Surprises",                         "00:03:48", "Alternativo",      7,  9),
    ("Lucky",                                "00:04:19", "Alternativo",      7,  9),
    ("Everything in Its Right Place",        "00:04:11", "Eletrônico",       7, 10),
    ("Idioteque",                            "00:05:09", "Eletrônico",       7, 10),
    ("The National Anthem",                  "00:05:51", "Alternativo",      7, 10),
    ("Get Lucky",                            "00:06:09", "Eletrônico",       8, 11),
    ("Instant Crush",                        "00:05:37", "Eletrônico",       8, 11),
    ("Lose Yourself to Dance",               "00:05:53", "Eletrônico",       8, 11),
    ("Giorgio by Moroder",                   "00:09:04", "Eletrônico",       8, 11),
    ("Let It Happen",                        "00:07:46", "Psicodélico",      9, 12),
    ("The Less I Know the Better",           "00:03:36", "Psicodélico",      9, 12),
    ("Eventually",                           "00:05:18", "Psicodélico",      9, 12),
    ("Do I Wanna Know?",                     "00:04:32", "Indie Rock",      10, 13),
    ("R U Mine?",                            "00:03:21", "Indie Rock",      10, 13),
    ("Why'd You Only Call Me When You're High?", "00:02:41", "Indie Rock",  10, 13),
    ("HUMBLE.",                              "00:02:57", "Hip-Hop",         11, 14),
    ("DNA.",                                 "00:03:05", "Hip-Hop",         11, 14),
    ("LOYALTY.",                             "00:03:38", "Hip-Hop",         11, 14),
]

# (nome, email, senha_plana, ativo, cpf, username, is_admin)
USUARIOS = [
    ("João Lucas Ribeiro", "joao@aurora.com",     "12345678", 1, "123.456.789-00", "joaolucas",    1),
    ("Gabriella Tavares",  "gabi@aurora.com",     "12345678", 1, "234.567.890-11", "gabytavares",  0),
    ("Maria Silva",        "maria@email.com",     "senha1234", 1, "345.678.901-22", "mariasilva",  0),
    ("Pedro Santos",       "pedro@email.com",     "senha1234", 1, "456.789.012-33", "pedrosantos", 0),
    ("Ana Costa",          "ana@email.com",       "senha1234", 1, "567.890.123-44", "anacosta",    0),
]

# (nome, publica, idx_usuario)
# idx_usuario: 0 = admin, 1 = gabi, 2 = maria, etc.
PLAYLISTS = [
    ("Mix Diário",         1, 0),   # admin
    ("Chill Vibes",        1, 0),   # admin
    ("Rock Clássico",      1, 0),   # admin
    ("Favoritas",          0, 1),   # gabi
    ("Workout",            1, 1),   # gabi
    ("Concentração",       1, 2),   # maria
    ("Noite Eletrônica",   1, 3),   # pedro
    ("Indie Selection",    1, 4),   # ana
    ("Acústico",           1, 1),   # gabi
    ("Hip-Hop Essentials", 1, 0),   # admin
]

# Índices de músicas por playlist (baseados em MUSICAS)
PLAYLIST_SONGS = {
    0: [0,1,2,3,4,17,18,24,27,30],        # Mix Diário
    1: [1,7,8,18,19,24,25,31,32,41,42],   # Chill Vibes
    2: [0,3,4,13,14,15,17,21,22,30,31],   # Rock Clássico
    3: [0,2,17,18,19,24,30,31,32],         # Favoritas
    4: [3,4,13,14,15,21,44,45,47,48],      # Workout
    5: [6,7,8,30,31,32,33,34,35,36],       # Concentração
    6: [37,38,39,40,34,35],                # Noite Eletrônica
    7: [44,45,46],                         # Indie Selection
    8: [1,2,18,19,24,25,26],               # Acústico
    9: [47,48,49],                         # Hip-Hop Essentials
}


def _get_conn():
    return pymysql.connect(**DB_CONFIG)


def _get_ids(cursor, tabela, coluna):
    cursor.execute(f"SELECT {coluna} FROM {tabela} ORDER BY {coluna}")
    return [row[coluna] for row in cursor.fetchall()]


def init_if_empty():
    """Verifica se o banco está vazio e, se sim, insere todos os dados iniciais."""
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as total FROM artista")
            total = cur.fetchone()["total"]
            if total > 0:
                print("✅ Banco já populado — seed ignorado.")
                return

        print("🌱 Banco vazio — iniciando seed automático...")
        with conn.cursor() as cur:
            cur.execute("SET FOREIGN_KEY_CHECKS = 0")
            for t in ["historico_reproducao", "curtida", "playlist_contem_musica",
                      "playlist", "musica", "album", "artista", "usuario"]:
                cur.execute(f"DELETE FROM {t}")
                try:
                    cur.execute(f"ALTER TABLE {t} AUTO_INCREMENT = 1")
                except Exception:
                    pass
            cur.execute("SET FOREIGN_KEY_CHECKS = 1")
            conn.commit()

            # Artistas
            for nome in ARTISTAS:
                cur.execute("INSERT INTO artista (nome_artista) VALUES (%s)", (nome,))
            conn.commit()
            ids_art = _get_ids(cur, "artista", "id_artista")

            # Álbuns
            for nome, data, idx in ALBUNS:
                cur.execute(
                    "INSERT INTO album (nome_album, data_lancamento, id_artista) VALUES (%s, %s, %s)",
                    (nome, data, ids_art[idx])
                )
            conn.commit()
            ids_alb = _get_ids(cur, "album", "id_album")

            # Músicas
            for titulo, duracao, genero, idx_a, idx_al in MUSICAS:
                cur.execute(
                    "INSERT INTO musica (titulo, duracao, genero, id_artista, id_album) VALUES (%s,%s,%s,%s,%s)",
                    (titulo, duracao, genero, ids_art[idx_a], ids_alb[idx_al])
                )
            conn.commit()
            ids_mus = _get_ids(cur, "musica", "id_musica")

            # Usuários
            for nome, email, senha, ativo, cpf, username, is_admin in USUARIOS:
                senha_hash = pwd_context.hash(str(senha)[:71])
                cur.execute(
                    "INSERT INTO usuario (nome, email, senha, ativo, cpf, username, is_admin) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (nome, email, senha_hash, ativo, cpf, username, is_admin)
                )
            conn.commit()
            ids_usr = _get_ids(cur, "usuario", "id_usuario")

            # Playlists
            for nome, publica, idx_usr in PLAYLISTS:
                cur.execute(
                    "INSERT INTO playlist (nome, publica, id_usuario) VALUES (%s,%s,%s)",
                    (nome, publica, ids_usr[idx_usr])
                )
            conn.commit()
            ids_pl = _get_ids(cur, "playlist", "id_playlist")

            # Associações playlist ↔ música
            for pl_idx, song_indices in PLAYLIST_SONGS.items():
                if pl_idx >= len(ids_pl):
                    continue
                pl_id = ids_pl[pl_idx]
                for s_idx in song_indices:
                    if s_idx < len(ids_mus):
                        try:
                            cur.execute(
                                "INSERT INTO playlist_contem_musica (id_playlist, id_musica) VALUES (%s,%s)",
                                (pl_id, ids_mus[s_idx])
                            )
                        except Exception:
                            pass
            conn.commit()

        print("✅ Seed automático concluído com sucesso!")
    except Exception as e:
        print(f"❌ Erro no seed automático: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()
