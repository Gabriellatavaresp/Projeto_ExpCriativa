import pymysql

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "Puc@12345A",
    "database": "AuroraStreaming", 
    "cursorclass": pymysql.cursors.DictCursor
}

def get_db():
    db = pymysql.connect(**DB_CONFIG)
    try:
        yield db
    finally:
        db.close()
