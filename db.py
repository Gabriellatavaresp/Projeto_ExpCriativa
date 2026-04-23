import pymysql

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "PUC@1234",
    "database": "AuroraStreaming", 
    "cursorclass": pymysql.cursors.DictCursor
}

def get_db():
    db = pymysql.connect(**DB_CONFIG)
    try:
        yield db
    finally:
        db.close()