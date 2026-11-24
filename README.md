# CampusSpace – Smart Campus Classroom Availability (Flask + MySQL PWA)
## Run
1. Install Python 3.10+ and MySQL 8. `pip install -r requirements.txt`
2. Copy `.env.example` to `.env`; set your MySQL password, ADMIN_PASSWORD and SECRET_KEY.
3. `python seed.py` (creates DB + tables, loads CS/AIDS/IT timetables)
4. `python app.py` -> http://localhost:5000 (admin: /admin)
## Notes
- Statuses: timetable (Class Ongoing) > latest valid update (<=30 min) > Unverified (none / expired / last two updates disagree / 3+ open reports).
- Times are Asia/Kolkata. Install as PWA from the browser menu (service worker needs localhost or HTTPS).
- Capacities are placeholders (60). Set real ones in /admin. Add departments in /admin or `timetable_data.py`.
- Labs and TG slots have no CR number, so they are not in the data.
