from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from db import q
IST = ZoneInfo("Asia/Kolkata"); WINDOW_MIN = 30; REPORT_LIMIT = 3
def now(): return datetime.now(IST).replace(tzinfo=None)

def statuses(t=None, room_id=None):
    """Priority: timetable -> latest valid student update -> Unverified (none, expired, conflicting, or heavily reported)."""
    t = t or now(); sec = t.hour * 3600 + t.minute * 60; since = t - timedelta(minutes=WINDOW_MIN)
    rooms = q("""SELECT c.id, c.room_no, c.capacity, (SELECT GROUP_CONCAT(DISTINCT dept_code ORDER BY dept_code)
                 FROM timetable_slots s WHERE s.classroom_id=c.id) depts FROM classrooms c
                 WHERE (%s IS NULL OR c.id=%s) ORDER BY c.room_no""", (room_id, room_id))
    slots = q("""SELECT classroom_id, dept_code, subject, faculty, TIME_TO_SEC(start_time) a, TIME_TO_SEC(end_time) b,
                 TIME_FORMAT(start_time,'%H:%i') st, TIME_FORMAT(end_time,'%H:%i') et
                 FROM timetable_slots WHERE day_of_week=%s ORDER BY start_time""", (t.weekday(),))
    ups = q("SELECT classroom_id, student_count FROM student_updates WHERE created_at>=%s ORDER BY created_at DESC, id DESC", (since,))
    reps = {r["classroom_id"]: r["n"] for r in q(
        "SELECT classroom_id, COUNT(*) n FROM reports WHERE created_at>=%s AND resolved=0 GROUP BY classroom_id", (since,))}
    out = []
    for r in rooms:
        mine = [s for s in slots if s["classroom_id"] == r["id"]]
        cur = next((s for s in mine if s["a"] <= sec < s["b"]), None)
        nxt = next((s for s in mine if s["a"] > sec), None)
        u = [x["student_count"] for x in ups if x["classroom_id"] == r["id"]]
        count, detail = None, ""
        if cur:
            st = "Class Ongoing"; detail = f"{cur['subject']} ({cur['dept_code']}) until {cur['et']}"
        elif not u: st = "Unverified"; detail = "No update in the last 30 minutes."
        elif len(u) > 1 and (u[0] > 0) != (u[1] > 0): st = "Unverified"; detail = "Recent updates disagree."
        elif reps.get(r["id"], 0) >= REPORT_LIMIT: st = "Unverified"; detail = "Reported as incorrect; under review."
        else:
            count = u[0]; st = "Occupied" if count > 0 else "Vacant"
        if nxt and st != "Class Ongoing": detail = (detail + " " if detail else "") + f"Next lecture {nxt['st']} ({nxt['dept_code']})."
        out.append({"id": r["id"], "room_no": r["room_no"], "capacity": r["capacity"],
                    "depts": (r["depts"] or "").split(",") if r["depts"] else [], "status": st, "count": count,
                    "pct": round(count * 100 / r["capacity"]) if count is not None and r["capacity"] else None,
                    "detail": detail, "schedule": [{"time": f"{s['st']}-{s['et']}", "subject": s["subject"], "dept": s["dept_code"], "faculty": s["faculty"]} for s in mine]})
    return out
