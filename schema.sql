CREATE DATABASE IF NOT EXISTS campusspace CHARACTER SET utf8mb4;
USE campusspace;
CREATE TABLE IF NOT EXISTS departments (
  code VARCHAR(10) PRIMARY KEY, name VARCHAR(80) NOT NULL);
CREATE TABLE IF NOT EXISTS classrooms (
  id INT AUTO_INCREMENT PRIMARY KEY, room_no VARCHAR(30) NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 60);
CREATE TABLE IF NOT EXISTS timetable_slots (
  id INT AUTO_INCREMENT PRIMARY KEY, dept_code VARCHAR(10) NOT NULL, classroom_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Mon..6=Sun',
  start_time TIME NOT NULL, end_time TIME NOT NULL,
  subject VARCHAR(60) NOT NULL, faculty VARCHAR(40),
  FOREIGN KEY (dept_code) REFERENCES departments(code) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  INDEX (classroom_id, day_of_week));
CREATE TABLE IF NOT EXISTS student_updates (
  id INT AUTO_INCREMENT PRIMARY KEY, classroom_id INT NOT NULL,
  student_count INT NOT NULL, created_at DATETIME NOT NULL,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  INDEX (classroom_id, created_at));
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY, classroom_id INT NOT NULL,
  shown_status VARCHAR(20), note VARCHAR(200), created_at DATETIME NOT NULL,
  resolved TINYINT NOT NULL DEFAULT 0,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE);
