import pymysql

DB_CONFIG = {
    "host": "localhost",
    "port": 3307,
    "user": "root",
    "password": "1234",
    "database": "AuroraStreaming", 
    "cursorclass": pymysql.cursors.DictCursor
}

def get_db():
    db = pymysql.connect(**DB_CONFIG)
    try:
        yield db
    finally:
        db.close()
