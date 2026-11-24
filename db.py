import os, mysql.connector
from dotenv import load_dotenv
load_dotenv()
def conn(db=True):
    port = int(os.getenv("DB_PORT", 3306))
    ssl_ca = (os.getenv("DB_SSL_CA") or "").strip()

    ssl_kwargs = {}
    if ssl_ca:
        ssl_kwargs = {
            "ssl_ca": ssl_ca,
            "ssl_verify_cert": True,
            "ssl_verify_identity": True,
        }

    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        port=port,
        **ssl_kwargs,
        **({"database": os.getenv("DB_NAME", "campusspace")} if db else {})
    )
def q(sql, args=(), one=False, write=False):
    c = conn(); cur = c.cursor(dictionary=True)
    try:
        cur.execute(sql, args)
        if write: c.commit(); return cur.lastrowid
        return cur.fetchone() if one else cur.fetchall()
    finally: cur.close(); c.close()
