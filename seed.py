"""
seed.py — Popula o banco AuroraStreaming com dados realistas.
Uso: python3 seed.py

Schema real:
  artista:  id_artista, nome_artista
  album:    id_album, nome_album, data_lancamento, id_artista
  musica:   id_musica, titulo, duracao(TIME), genero, id_artista, id_album
  usuario:  id_usuario, nome, email, senha, foto_perfil, ativo, cpf, username, is_admin
  playlist: id_playlist, nome, publica, id_usuario
  playlist_contem_musica: id_playlist, id_musica
  curtida:  id_usuario, id_musica, data_curtida
  historico_reproducao: id, id_usuario, id_musica, data_reproducao
"""

import pymysql
from db import DB_CONFIG
from datetime import datetime, timedelta
import random
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_connection():
    return pymysql.connect(**DB_CONFIG)



ARTISTAS = [
    "Queen", "Pink Floyd", "Led Zeppelin", "The Beatles", "Eagles",
    "John Lennon", "David Bowie", "Radiohead", "Daft Punk",
    "Tame Impala", "Arctic Monkeys", "Kendrick Lamar",
]

ALBUNS = [
    ("A Night at the Opera", "1975-11-21", 0),
    ("News of the World", "1977-10-28", 0),
    ("The Dark Side of the Moon", "1973-03-01", 1),
    ("The Wall", "1979-11-30", 1),
    ("Led Zeppelin IV", "1971-11-08", 2),
    ("Abbey Road", "1969-09-26", 3),
    ("Hotel California", "1976-12-08", 4),
    ("Imagine", "1971-09-09", 5),
    ("Ziggy Stardust", "1972-06-16", 6),
    ("OK Computer", "1997-05-21", 7),
    ("Kid A", "2000-10-02", 7),
    ("Random Access Memories", "2013-05-17", 8),
    ("Currents", "2015-07-17", 9),
    ("AM", "2013-09-09", 10),
    ("DAMN.", "2017-04-14", 11),
]


MUSICAS = [
    ("Bohemian Rhapsody", "00:05:55", "Rock", 0, 0),
    ("Love of My Life", "00:03:39", "Balada", 0, 0),
    ("You're My Best Friend", "00:02:50", "Pop/Rock", 0, 0),
    ("We Will Rock You", "00:02:01", "Rock", 0, 1),
    ("We Are the Champions", "00:02:59", "Rock", 0, 1),
    ("Spread Your Wings", "00:04:34", "Rock", 0, 1),
    ("Money", "00:06:22", "Rock Progressivo", 1, 2),
    ("Time", "00:07:06", "Rock Progressivo", 1, 2),
    ("Breathe", "00:02:43", "Rock Progressivo", 1, 2),
    ("The Great Gig in the Sky", "00:04:36", "Rock Progressivo", 1, 2),
    ("Comfortably Numb", "00:06:22", "Rock Progressivo", 1, 3),
    ("Another Brick in the Wall", "00:03:59", "Rock Progressivo", 1, 3),
    ("Hey You", "00:04:40", "Rock Progressivo", 1, 3),
    ("Stairway to Heaven", "00:08:02", "Rock", 2, 4),
    ("Rock and Roll", "00:03:40", "Rock", 2, 4),
    ("Black Dog", "00:04:55", "Rock", 2, 4),
    ("Going to California", "00:03:31", "Folk Rock", 2, 4),
    ("Come Together", "00:04:19", "Rock", 3, 5),
    ("Here Comes the Sun", "00:03:05", "Pop", 3, 5),
    ("Something", "00:03:02", "Balada", 3, 5),
    ("Octopus's Garden", "00:02:51", "Pop", 3, 5),
    ("Hotel California", "00:06:30", "Rock", 4, 6),
    ("New Kid in Town", "00:05:04", "Rock", 4, 6),
    ("Life in the Fast Lane", "00:04:46", "Rock", 4, 6),
    ("Imagine", "00:03:07", "Pop", 5, 7),
    ("Jealous Guy", "00:04:14", "Pop", 5, 7),
    ("Oh My Love", "00:02:43", "Balada", 5, 7),
    ("Starman", "00:04:10", "Glam Rock", 6, 8),
    ("Ziggy Stardust", "00:03:13", "Glam Rock", 6, 8),
    ("Suffragette City", "00:03:25", "Glam Rock", 6, 8),
    ("Paranoid Android", "00:06:23", "Alternativo", 7, 9),
    ("Karma Police", "00:04:21", "Alternativo", 7, 9),
    ("No Surprises", "00:03:48", "Alternativo", 7, 9),
    ("Lucky", "00:04:19", "Alternativo", 7, 9),
    ("Everything in Its Right Place", "00:04:11", "Eletrônico", 7, 10),
    ("Idioteque", "00:05:09", "Eletrônico", 7, 10),
    ("The National Anthem", "00:05:51", "Alternativo", 7, 10),
    ("Get Lucky", "00:06:09", "Eletrônico", 8, 11),
    ("Instant Crush", "00:05:37", "Eletrônico", 8, 11),
    ("Lose Yourself to Dance", "00:05:53", "Eletrônico", 8, 11),
    ("Giorgio by Moroder", "00:09:04", "Eletrônico", 8, 11),
    ("Let It Happen", "00:07:46", "Psicodélico", 9, 12),
    ("The Less I Know the Better", "00:03:36", "Psicodélico", 9, 12),
    ("Eventually", "00:05:18", "Psicodélico", 9, 12),
    ("Do I Wanna Know?", "00:04:32", "Indie Rock", 10, 13),
    ("R U Mine?", "00:03:21", "Indie Rock", 10, 13),
    ("Why'd You Only Call Me When You're High?", "00:02:41", "Indie Rock", 10, 13),
    ("HUMBLE.", "00:02:57", "Hip-Hop", 11, 14),
    ("DNA.", "00:03:05", "Hip-Hop", 11, 14),
    ("LOYALTY.", "00:03:38", "Hip-Hop", 11, 14),
]


USUARIOS = [
    ("João Lucas Ribeiro", "joao@aurora.com", "12345678", 1, "123.456.789-00", "joaolucas", 1),
    ("Gabriella Tavares", "gabi@aurora.com", "12345678", 1, "234.567.890-11", "gabytavares"),
    ("Maria Silva", "maria@email.com", "senha1234", 1, "345.678.901-22", "mariasilva"),
    ("Pedro Santos", "pedro@email.com", "senha1234", 1, "456.789.012-33", "pedrosantos"),
    ("Ana Costa", "ana@email.com", "senha1234", 1, "567.890.123-44", "anacosta"),
    ("Lucas Oliveira", "lucas@email.com", "senha1234", 1, "678.901.234-55", "lucasoliv"),
    ("Beatriz Fernandes", "bia@email.com", "senha1234", 1, "789.012.345-66", "biafernandes"),
    ("Carlos Mendes", "carlos@email.com", "senha1234", 1, "890.123.456-77", "carlosmendes"),
    ("Juliana Rocha", "juliana@email.com", "senha1234", 1, "901.234.567-88", "julirocha"),
    ("Rafael Lima", "rafael@email.com", "senha1234", 0, "012.345.678-99", "rafalima"),
    ("Fernanda Souza", "fernanda@email.com", "senha1234", 1, "111.222.333-44", "fesouza"),
    ("Thiago Almeida", "thiago@email.com", "senha1234", 1, "555.666.777-88", "thiagoalm"),
]


PLAYLISTS = [
    ("Mix Diário", 1, 0),
    ("Chill Vibes", 1, 0),
    ("Rock Clássico", 1, 1),
    ("Favoritas 2024", 0, 2),
    ("Workout", 1, 3),
    ("Concentração", 1, 4),
    ("Noite Eletrônica", 1, 5),
    ("Indie Selection", 1, 6),
    ("Acústico", 1, 7),
    ("Hip-Hop Essentials", 1, 8),
]




def limpar_tabelas(cursor):
    print("🗑  Limpando tabelas...")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    for t in ["historico_reproducao", "curtida", "playlist_contem_musica",
              "playlist", "musica", "album", "artista", "usuario"]:
        cursor.execute(f"DELETE FROM {t}")
        cursor.execute(f"ALTER TABLE {t} AUTO_INCREMENT = 1")
        print(f"   ✓ {t}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")


def seed_artistas(cursor):
    print("\n🎤 Inserindo artistas...")
    for nome in ARTISTAS:
        cursor.execute("INSERT INTO artista (nome_artista) VALUES (%s)", (nome,))
        print(f"   ✓ {nome}")


def seed_albuns(cursor, ids_artista):
    print("\n💿 Inserindo álbuns...")
    for nome, data, idx in ALBUNS:
        cursor.execute(
            "INSERT INTO album (nome_album, data_lancamento, id_artista) VALUES (%s, %s, %s)",
            (nome, data, ids_artista[idx])
        )
        print(f"   ✓ {nome}")


def seed_musicas(cursor, ids_artista, ids_album):
    print("\n🎵 Inserindo músicas...")
    for titulo, duracao, genero, idx_a, idx_al in MUSICAS:
        cursor.execute(
            "INSERT INTO musica (titulo, duracao, genero, id_artista, id_album) VALUES (%s, %s, %s, %s, %s)",
            (titulo, duracao, genero, ids_artista[idx_a], ids_album[idx_al])
        )
        print(f"   ✓ {titulo}")


def seed_usuarios(cursor):
    print("\n👤 Inserindo usuários com senhas seguras...")
    for u in USUARIOS:
        nome, email, senha, ativo, cpf, user = u[:6]
        is_admin = u[6] if len(u) > 6 else 0
        senha_hash = pwd_context.hash(senha[:72])
        cursor.execute(
            "INSERT INTO usuario (nome, email, senha, ativo, cpf, username, is_admin) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (nome, email, senha_hash, ativo, cpf, user, is_admin) 
        )
        print(f"   ✓ {nome}")

def seed_playlists(cursor, ids_usuario):
    print("\n📋 Inserindo playlists...")
    for nome, publica, idx in PLAYLISTS:
        cursor.execute(
            "INSERT INTO playlist (nome, publica, id_usuario) VALUES (%s, %s, %s)",
            (nome, publica, ids_usuario[idx])
        )
        print(f"   ✓ {nome}")


def seed_playlist_musicas(cursor, ids_playlist, ids_musica):
    print("\n🔗 Associando músicas às playlists...")
    random.seed(42)
    total = 0
    for pl_id in ids_playlist:
        qtd = random.randint(5, 12)
        selecionadas = random.sample(ids_musica, min(qtd, len(ids_musica)))
        for m_id in selecionadas:
            cursor.execute(
                "INSERT INTO playlist_contem_musica (id_playlist, id_musica) VALUES (%s, %s)",
                (pl_id, m_id)
            )
            total += 1
    print(f"   ✓ {total} associações criadas")


def seed_curtidas(cursor, ids_usuario, ids_musica):
    print("\n❤️  Inserindo curtidas...")
    random.seed(123)
    curtidas = set()
    total = 0
    for u_id in ids_usuario:
        qtd = random.randint(3, 10)
        for m_id in random.sample(ids_musica, min(qtd, len(ids_musica))):
            if (u_id, m_id) not in curtidas:
                cursor.execute(
                    "INSERT INTO curtida (id_usuario, id_musica) VALUES (%s, %s)",
                    (u_id, m_id)
                )
                curtidas.add((u_id, m_id))
                total += 1
    print(f"   ✓ {total} curtidas criadas")


def seed_historico(cursor, ids_usuario, ids_musica):
    print("\n📊 Inserindo histórico de reprodução...")
    random.seed(456)
    total = 0
    agora = datetime.now()
    for u_id in ids_usuario:
        for _ in range(random.randint(5, 15)):
            m_id = random.choice(ids_musica)
            data = agora - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            cursor.execute(
                "INSERT INTO historico_reproducao (id_usuario, id_musica, data_reproducao) VALUES (%s, %s, %s)",
                (u_id, m_id, data.strftime("%Y-%m-%d %H:%M:%S"))
            )
            total += 1
    print(f"   ✓ {total} registros criados")


def get_ids(cursor, tabela, coluna):
    cursor.execute(f"SELECT {coluna} FROM {tabela} ORDER BY {coluna}")
    return [row[coluna] for row in cursor.fetchall()]




def main():
    print("=" * 50)
    print("🌅 Aurora Streaming — Seed de Dados")
    print("=" * 50)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            limpar_tabelas(cur)
            conn.commit()

            seed_artistas(cur); conn.commit()
            ids_art = get_ids(cur, "artista", "id_artista")

            seed_albuns(cur, ids_art); conn.commit()
            ids_alb = get_ids(cur, "album", "id_album")

            seed_musicas(cur, ids_art, ids_alb); conn.commit()
            ids_mus = get_ids(cur, "musica", "id_musica")

            seed_usuarios(cur); conn.commit()
            ids_usr = get_ids(cur, "usuario", "id_usuario")

            seed_playlists(cur, ids_usr); conn.commit()
            ids_pl = get_ids(cur, "playlist", "id_playlist")

            seed_playlist_musicas(cur, ids_pl, ids_mus); conn.commit()
            seed_curtidas(cur, ids_usr, ids_mus); conn.commit()
            seed_historico(cur, ids_usr, ids_mus); conn.commit()

        print("\n" + "=" * 50)
        print("✅ Seed concluído com sucesso!")
        print("=" * 50)
        with conn.cursor() as cur:
            for t, c in [("artista","id_artista"),("album","id_album"),("musica","id_musica"),
                         ("usuario","id_usuario"),("playlist","id_playlist"),
                         ("playlist_contem_musica","id_playlist"),("curtida","id_usuario"),
                         ("historico_reproducao","id")]:
                cur.execute(f"SELECT COUNT(*) as total FROM {t}")
                print(f"   {t}: {cur.fetchone()['total']} registros")
    except Exception as e:
        print(f"\n❌ Erro durante o seed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
