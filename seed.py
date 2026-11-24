"""Run once: python seed.py  -> creates the database/tables and loads the 3 timetables."""
from db import conn, q
from timetable_data import DEPARTMENTS, TIMETABLES
c = conn(db=False); cur = c.cursor()
for stmt in open("schema.sql").read().split(";"):
    if stmt.strip(): cur.execute(stmt)
c.commit(); cur.close(); c.close()
q("DELETE FROM timetable_slots", write=True)
for code, name in DEPARTMENTS.items():
    q("INSERT INTO departments(code,name) VALUES(%s,%s) ON DUPLICATE KEY UPDATE name=VALUES(name)", (code, name), write=True)
for code, rows in TIMETABLES.items():
    for day, st, et, room, subj, fac in rows:
        q("INSERT IGNORE INTO classrooms(room_no) VALUES(%s)", (room,), write=True)
        rid = q("SELECT id FROM classrooms WHERE room_no=%s", (room,), one=True)["id"]
        q("INSERT INTO timetable_slots(dept_code,classroom_id,day_of_week,start_time,end_time,subject,faculty) VALUES(%s,%s,%s,%s,%s,%s,%s)",
          (code, rid, day, st, et, subj, fac), write=True)
print("Seeded. Default capacity is 60 for every room - set real capacities in /admin.")
