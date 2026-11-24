import os, mysql.connector
from dotenv import load_dotenv
load_dotenv()
def conn(db=True):
    return mysql.connector.connect(host=os.getenv("DB_HOST","localhost"), user=os.getenv("DB_USER","root"),
        password=os.getenv("DB_PASSWORD",""), **({"database": os.getenv("DB_NAME","campusspace")} if db else {}))
def q(sql, args=(), one=False, write=False):
    c = conn(); cur = c.cursor(dictionary=True)
    try:
        cur.execute(sql, args)
        if write: c.commit(); return cur.lastrowid
        return cur.fetchone() if one else cur.fetchall()
    finally: cur.close(); c.close()
