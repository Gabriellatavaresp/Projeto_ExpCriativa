import pymysql

DB_CONFIG = {
    "host": "localhost",
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
