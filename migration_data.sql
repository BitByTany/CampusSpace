-- =============================================================
-- CampusSpace Data-Only Migration Script for TiDB Cloud
-- Generated on: 2026-11-24 21:21:12
-- Total records: 80
-- Order: departments -> classrooms -> timetable_slots -> student_updates -> reports
-- =============================================================

USE campusspace;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. departments (3 records)
INSERT INTO departments (code, name) VALUES ('AIDS', 'AI & Data Science');
INSERT INTO departments (code, name) VALUES ('CS', 'Computer Science (SY A)');
INSERT INTO departments (code, name) VALUES ('IT', 'Information Technology');

-- 2. classrooms (10 records)
INSERT INTO classrooms (id, room_no, capacity) VALUES (1, '37', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (2, '36', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (3, '11', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (10, '16', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (18, '34', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (32, '33', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (36, '40', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (51, '12', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (67, '41', 60);
INSERT INTO classrooms (id, room_no, capacity) VALUES (68, '26', 60);

-- 3. timetable_slots (51 records)
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (1, 'CS', 1, 0, '10:00:00', '11:00:00', 'COA', 'NS');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (2, 'CS', 2, 0, '11:15:00', '12:15:00', 'MFCE', 'MN');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (3, 'CS', 3, 0, '13:15:00', '14:15:00', 'FDS', 'DDR');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (4, 'CS', 1, 1, '14:15:00', '15:15:00', 'FDS', 'DDR');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (5, 'CS', 1, 1, '15:15:00', '16:15:00', 'EEM', 'MAP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (6, 'CS', 1, 1, '16:30:00', '17:30:00', 'DT', 'AC');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (7, 'CS', 1, 1, '17:30:00', '18:30:00', 'MFCE', 'MN');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (8, 'CS', 2, 2, '09:00:00', '11:00:00', 'NC2', '');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (9, 'CS', 2, 2, '11:15:00', '13:15:00', 'OE', 'KK');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (10, 'CS', 10, 2, '14:15:00', '15:15:00', 'MFCE', 'MN');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (11, 'CS', 10, 2, '15:15:00', '16:15:00', 'COA', 'NS');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (12, 'CS', 10, 2, '16:30:00', '17:30:00', 'FDS', 'DDR');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (13, 'CS', 2, 3, '09:00:00', '11:00:00', 'SDG', '');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (14, 'CS', 2, 3, '11:15:00', '13:15:00', 'MDM', 'SM');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (15, 'CS', 2, 4, '09:00:00', '10:00:00', 'COA', 'NS');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (16, 'CS', 2, 4, '10:00:00', '11:00:00', 'EEM', 'MAP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (17, 'CS', 2, 4, '11:15:00', '13:15:00', 'OE', 'KK');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (18, 'AIDS', 18, 0, '11:15:00', '13:15:00', 'PTC', '');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (19, 'AIDS', 18, 0, '14:15:00', '16:15:00', 'SDG', '');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (20, 'AIDS', 18, 0, '16:15:00', '17:15:00', 'STAT', 'SKB');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (21, 'AIDS', 18, 0, '17:15:00', '18:15:00', 'DT', 'RTI');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (22, 'AIDS', 18, 1, '11:15:00', '12:15:00', 'FDS', 'TP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (23, 'AIDS', 18, 1, '12:15:00', '13:15:00', 'SE', 'SM');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (24, 'AIDS', 18, 1, '16:15:00', '17:15:00', 'SE', 'SM');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (25, 'AIDS', 18, 1, '17:15:00', '18:15:00', 'STAT', 'SKB');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (26, 'AIDS', 18, 2, '11:15:00', '13:15:00', 'OE-CTPS', 'AAM');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (27, 'AIDS', 18, 2, '14:15:00', '15:15:00', 'FDS', 'TP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (28, 'AIDS', 18, 2, '15:15:00', '16:15:00', 'PM', 'SS');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (30, 'AIDS', 18, 3, '14:15:00', '15:15:00', 'PM', 'SS');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (31, 'AIDS', 18, 3, '15:15:00', '16:15:00', 'FDS', 'TP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (32, 'AIDS', 32, 4, '11:15:00', '12:15:00', 'FDS', 'TP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (33, 'AIDS', 32, 4, '12:15:00', '13:15:00', 'STAT', 'SKB');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (34, 'AIDS', 32, 4, '14:15:00', '15:15:00', 'SE', 'SM');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (35, 'AIDS', 32, 4, '15:15:00', '16:15:00', 'PM', 'SS');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (36, 'IT', 36, 0, '09:00:00', '10:00:00', 'ADCM', 'SKazi');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (37, 'IT', 36, 0, '10:00:00', '11:00:00', 'NC1', 'MB');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (38, 'IT', 36, 0, '14:15:00', '16:15:00', 'NC-4', '');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (39, 'IT', 36, 0, '16:30:00', '17:30:00', 'FDS', 'RP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (40, 'IT', 36, 0, '17:30:00', '18:30:00', 'DBMS', 'SR');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (41, 'IT', 36, 1, '11:15:00', '12:15:00', 'ADCM', 'SKazi');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (42, 'IT', 36, 1, '12:15:00', '13:15:00', 'PM', 'AP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (43, 'IT', 36, 1, '14:15:00', '15:15:00', 'PM', 'AP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (44, 'IT', 36, 1, '15:15:00', '16:15:00', 'ADCM', 'SKazi');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (45, 'IT', 36, 2, '09:00:00', '11:00:00', 'SDG', '');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (46, 'IT', 36, 2, '11:15:00', '13:15:00', 'OE', 'SG');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (47, 'IT', 36, 3, '11:15:00', '13:15:00', 'MDM', 'ASG');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (48, 'IT', 36, 3, '16:30:00', '17:30:00', 'FDS', 'RP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (49, 'IT', 36, 3, '17:30:00', '18:30:00', 'DBMS', 'SR');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (50, 'IT', 36, 4, '11:15:00', '13:15:00', 'OE', 'SG');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (51, 'IT', 51, 4, '14:15:00', '15:15:00', 'FDS', 'RP');
INSERT INTO timetable_slots (id, dept_code, classroom_id, day_of_week, start_time, end_time, subject, faculty) VALUES (52, 'IT', 51, 4, '15:15:00', '16:15:00', 'DBMS', 'SR');

-- 4. student_updates (12 records)
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (1, 36, 0, '2026-11-23 23:48:44');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (2, 36, 1, '2026-11-23 23:48:50');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (3, 3, 0, '2026-11-24 11:48:30');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (4, 3, 5, '2026-11-24 11:48:40');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (5, 3, 5, '2026-11-24 11:48:59');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (6, 51, 0, '2026-11-24 11:50:29');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (7, 51, 0, '2026-11-24 11:50:30');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (8, 3, 1, '2026-11-24 12:53:57');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (9, 10, 0, '2026-11-24 12:54:16');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (10, 3, 4, '2026-11-24 13:10:10');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (11, 51, 2, '2026-11-24 19:42:29');
INSERT INTO student_updates (id, classroom_id, student_count, created_at) VALUES (12, 32, 0, '2026-11-24 19:42:35');

-- 5. reports (4 records)
INSERT INTO reports (id, classroom_id, shown_status, note, created_at, resolved) VALUES (1, 3, 'Occupied', 'only 4 people present ', '2026-11-24 11:49:25', 1);
INSERT INTO reports (id, classroom_id, shown_status, note, created_at, resolved) VALUES (2, 3, 'Occupied', 'Air conditioner leaking', '2026-11-24 11:51:24', 1);
INSERT INTO reports (id, classroom_id, shown_status, note, created_at, resolved) VALUES (3, 3, 'Occupied', 'Air conditioner leaking', '2026-11-24 11:54:45', 1);
INSERT INTO reports (id, classroom_id, shown_status, note, created_at, resolved) VALUES (4, 3, 'Occupied', '10 students ', '2026-11-24 13:10:29', 1);

SET FOREIGN_KEY_CHECKS = 1;
-- =============================================================
-- End of Data Migration Script
-- =============================================================
