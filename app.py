import os, csv, io
from functools import wraps
from flask import Flask, jsonify, request, session, send_from_directory
from db import q
from status import statuses, now
app = Flask(__name__, static_folder="static", static_url_path="")

# Security credentials and environment validation
INSECURE_DEFAULTS = {"dev-secret", "change-this-too", "change-me", "admin", "secret", "password"}
raw_secret = (os.getenv("SECRET_KEY") or "").strip()
raw_admin_pw = (os.getenv("ADMIN_PASSWORD") or "").strip()

is_production = any(
    os.getenv(flag, "").strip().lower() in ("production", "prod", "1", "true")
    for flag in ("FLASK_ENV", "APP_ENV", "ENV", "PRODUCTION")
)

if is_production:
    if not raw_secret or raw_secret in INSECURE_DEFAULTS:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: Application cannot start in production because "
            "SECRET_KEY is missing or still set to a development default. "
            "Please configure a strong, unique SECRET_KEY in your production environment."
        )
    if not raw_admin_pw or raw_admin_pw in INSECURE_DEFAULTS:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: Application cannot start in production because "
            "ADMIN_PASSWORD is missing or still set to an insecure default ('admin' / 'change-me'). "
            "Please configure a strong, unique ADMIN_PASSWORD in your production environment."
        )

app.secret_key = raw_secret or "dev-secret"
ADMIN_PASSWORD = raw_admin_pw or "admin"

@app.get("/")
def home(): return send_from_directory("static", "index.html")
@app.get("/admin")
def admin_page(): return send_from_directory("static", "admin.html")

# ---------- student API ----------
@app.get("/api/departments")
def departments(): return jsonify(q("SELECT code,name FROM departments ORDER BY code"))

@app.get("/api/rooms")
def rooms():
    a = request.args; text = a.get("q", "").strip().lower(); dept = a.get("dept", ""); stat = a.get("status", "")
    cap = int(a.get("min_capacity") or 0)
    res = [r for r in statuses() if (not text or text in r["room_no"].lower()) and (not dept or dept in r["depts"])
           and (not stat or r["status"] == stat) and r["capacity"] >= cap]
    for r in res: r.pop("schedule")
    return jsonify(rooms=res, time=now().strftime("%a %H:%M"))

@app.get("/api/rooms/<int:rid>")
def room(rid):
    r = statuses(room_id=rid)
    return jsonify(r[0]) if r else (jsonify(error="Room not found"), 404)

@app.post("/api/rooms/<int:rid>/update")
def update(rid):
    r = statuses(room_id=rid)
    if not r: return jsonify(error="Room not found"), 404
    try: n = int(request.json.get("student_count"))
    except (TypeError, ValueError): return jsonify(error="Enter the number of students present."), 400
    if not 0 <= n <= r[0]["capacity"]: return jsonify(error=f"Count must be between 0 and {r[0]['capacity']}."), 400
    q("INSERT INTO student_updates(classroom_id,student_count,created_at) VALUES(%s,%s,%s)", (rid, n, now()), write=True)
    return jsonify(ok=True)

@app.post("/api/rooms/<int:rid>/report")
def report(rid):
    r = statuses(room_id=rid)
    if not r: return jsonify(error="Room not found"), 404
    q("INSERT INTO reports(classroom_id,shown_status,note,created_at) VALUES(%s,%s,%s,%s)",
      (rid, r[0]["status"], (request.json.get("note") or "")[:200], now()), write=True)
    return jsonify(ok=True)

# ---------- admin API ----------
def admin(f):
    @wraps(f)
    def w(*a, **k):
        return f(*a, **k) if session.get("admin") else (jsonify(error="Login required"), 401)
    return w

@app.post("/api/admin/login")
def login():
    if request.json.get("password") == ADMIN_PASSWORD: session["admin"] = True; return jsonify(ok=True)
    return jsonify(error="Wrong password"), 401
@app.post("/api/admin/logout")
def logout(): session.clear(); return jsonify(ok=True)
@app.get("/api/admin/me")
def me(): return jsonify(admin=bool(session.get("admin")))

@app.get("/api/admin/rooms")
@admin
def a_rooms(): return jsonify(q("SELECT id,room_no,capacity FROM classrooms ORDER BY room_no"))
@app.post("/api/admin/rooms")
@admin
def a_room_add():
    d = request.json or {}
    room_no = str(d.get("room_no", "")).strip()
    if not room_no: return jsonify(error="Room number cannot be empty"), 400
    try: cap = int(d.get("capacity") or 60)
    except (TypeError, ValueError): cap = 60
    try:
        q("INSERT INTO classrooms(room_no,capacity) VALUES(%s,%s)", (room_no, cap), write=True)
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(error=str(e)), 400

@app.put("/api/admin/rooms/<int:rid>")
@admin
def a_room_edit(rid):
    d = request.json or {}
    room_no = str(d.get("room_no", "")).strip()
    if not room_no: return jsonify(error="Room number cannot be empty"), 400
    try: cap = int(d.get("capacity") or 60)
    except (TypeError, ValueError): cap = 60
    try:
        q("UPDATE classrooms SET room_no=%s,capacity=%s WHERE id=%s", (room_no, cap, rid), write=True)
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(error=str(e)), 400

@app.delete("/api/admin/rooms/<int:rid>")
@admin
def a_room_del(rid): q("DELETE FROM classrooms WHERE id=%s", (rid,), write=True); return jsonify(ok=True)

@app.post("/api/admin/departments")
@admin
def a_dept():
    d = request.json or {}
    code = str(d.get("code", "")).strip().upper()
    name = str(d.get("name", "")).strip()
    if not code or not name: return jsonify(error="Department code and name are required"), 400
    try:
        q("INSERT INTO departments(code,name) VALUES(%s,%s) ON DUPLICATE KEY UPDATE name=VALUES(name)", (code, name), write=True)
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(error=str(e)), 400

def add_slot(d):
    room = str(d.get("room_no", "")).strip()
    if not room: raise ValueError("Room number is required.")
    q("INSERT IGNORE INTO classrooms(room_no) VALUES(%s)", (room,), write=True)
    r = q("SELECT id FROM classrooms WHERE room_no=%s", (room,), one=True)
    if not r: raise ValueError(f"Could not find or create classroom '{room}'.")
    rid = r["id"]
    day = d.get("day_of_week") if "day_of_week" in d else (d.get("day") or d.get("day_of_week(0=Mon)"))
    if day is None: raise ValueError("day_of_week is required.")
    q("INSERT INTO timetable_slots(dept_code,classroom_id,day_of_week,start_time,end_time,subject,faculty) VALUES(%s,%s,%s,%s,%s,%s,%s)",
      (str(d["dept_code"]).strip().upper(), rid, int(day), d["start_time"], d["end_time"], d["subject"], d.get("faculty", "")), write=True)

@app.get("/api/admin/slots")
@admin
def a_slots():
    d = request.args.get("dept", "")
    return jsonify(q("""SELECT s.id,s.dept_code,c.room_no,s.day_of_week,TIME_FORMAT(start_time,'%H:%i') start_time,
        TIME_FORMAT(end_time,'%H:%i') end_time,s.subject,s.faculty FROM timetable_slots s JOIN classrooms c ON c.id=s.classroom_id
        WHERE (%s='' OR s.dept_code=%s) ORDER BY s.dept_code,s.day_of_week,s.start_time""", (d, d)))
@app.post("/api/admin/slots")
@admin
def a_slot_add():
    try: add_slot(request.json); return jsonify(ok=True)
    except Exception as e: return jsonify(error=str(e)), 400
@app.delete("/api/admin/slots/<int:sid>")
@admin
def a_slot_del(sid): q("DELETE FROM timetable_slots WHERE id=%s", (sid,), write=True); return jsonify(ok=True)
@app.post("/api/admin/timetable/upload")
@admin
def a_upload():
    """CSV header: dept_code,room_no,day_of_week(0=Mon),start_time,end_time,subject,faculty"""
    n = 0
    try:
        for row in csv.DictReader(io.StringIO(request.files["file"].read().decode("utf-8-sig"))): add_slot(row); n += 1
    except Exception as e: return jsonify(error=f"Stopped after {n} rows: {e}"), 400
    return jsonify(ok=True, rows=n)

@app.get("/api/admin/reports")
@admin
def a_reports():
    rows = q("SELECT r.id,c.room_no,r.shown_status,r.note,r.created_at FROM reports r JOIN classrooms c ON c.id=r.classroom_id WHERE r.resolved=0 ORDER BY r.created_at DESC")
    for r in rows: r["created_at"] = r["created_at"].strftime("%d %b %H:%M")
    return jsonify(rows)
@app.post("/api/admin/reports/<int:rid>/resolve")
@admin
def a_resolve(rid): q("UPDATE reports SET resolved=1 WHERE id=%s", (rid,), write=True); return jsonify(ok=True)

if __name__ == "__main__": app.run(debug=True, port=5000)
