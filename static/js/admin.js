const A = document.getElementById("app"), D = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const j = (u, m = "GET", b) => fetch(u, {method: m, headers: {"Content-Type": "application/json"}, body: b && JSON.stringify(b)}).then(r => r.json());
let tab = "rooms", dept = "";
const err = r => r.error && alert(r.error);
async function init() { (await j("/api/admin/me")).admin ? show() : login(); }
function login() {
  A.innerHTML = `<div class="card"><h2>Admin login</h2><div class="row"><input id="pw" type="password" placeholder="Password"><button id="go">Log in</button></div></div>`;
  go.onclick = async () => { const r = await j("/api/admin/login", "POST", {password: pw.value}); r.ok ? show() : alert(r.error); };
}
async function show() {
  const bar = `<div class="tabs">${["rooms","timetable","reports"].map(t => `<button class="${t===tab?"on":""}" onclick="tab='${t}';show()">${t[0].toUpperCase()+t.slice(1)}</button>`).join("")}<button class="ghost" onclick="j('/api/admin/logout','POST').then(init)">Log out</button></div>`;
  A.innerHTML = bar + await {rooms, timetable, reports}[tab]();
}
async function rooms() {
  const rs = await j("/api/admin/rooms");
  return `<div class="card"><div class="row"><input id="nr" placeholder="Room no. e.g. 41"><input id="nc" type="number" placeholder="Capacity"><button onclick="addRoom()">Add room</button></div></div>
  <div class="scroll"><table><tr><th>Room</th><th>Capacity</th><th></th></tr>${rs.map(r => `<tr><td>${r.room_no}</td><td><input id="c${r.id}" type="number" value="${r.capacity}" style="width:90px"></td>
  <td><button onclick="saveRoom(${r.id},'${r.room_no}')">Save</button> <button class="ghost" onclick="delRoom(${r.id})">Delete</button></td></tr>`).join("")}</table></div>`;
}
async function addRoom() { err(await j("/api/admin/rooms", "POST", {room_no: nr.value, capacity: nc.value || 60})); show(); }
async function saveRoom(id, no) { err(await j("/api/admin/rooms/" + id, "PUT", {room_no: no, capacity: document.getElementById("c" + id).value})); show(); }
async function delRoom(id) { if (confirm("Delete this room and its timetable slots?")) { await j("/api/admin/rooms/" + id, "DELETE"); show(); } }
async function timetable() {
  const ds = await fetch("/api/departments").then(r => r.json()), ss = await j("/api/admin/slots?dept=" + dept);
  const opts = ds.map(d => `<option value="${d.code}" ${d.code===dept?"selected":""}>${d.code}</option>`).join("");
  return `<div class="card"><div class="row"><select onchange="dept=this.value;show()"><option value="">All departments</option>${opts}</select>
   <input id="dc" placeholder="New dept code" style="max-width:130px"><input id="dn" placeholder="Dept name"><button onclick="addDept()">Add department</button></div></div>
  <div class="card"><b>Add a lecture</b><div class="row"><select id="sd">${opts}</select><input id="sr" placeholder="Room no."><select id="sw">${D.map((d,i)=>`<option value="${i}">${d}</option>`).join("")}</select>
   <input id="st" type="time"><input id="se" type="time"><input id="ss" placeholder="Subject"><input id="sf" placeholder="Faculty"><button onclick="addSlot()">Add lecture</button></div>
   <p><small>Or upload CSV (dept_code,room_no,day_of_week 0=Mon,start_time,end_time,subject,faculty):</small> <input type="file" id="csv" accept=".csv" onchange="upload()"></p></div>
  <div class="scroll"><table><tr><th>Dept</th><th>Room</th><th>Day</th><th>Time</th><th>Subject</th><th></th></tr>${ss.map(s => `<tr><td>${s.dept_code}</td><td>${s.room_no}</td><td>${D[s.day_of_week]}</td>
  <td>${s.start_time}-${s.end_time}</td><td>${s.subject}${s.faculty?" ("+s.faculty+")":""}</td><td><button class="ghost" onclick="delSlot(${s.id})">Delete</button></td></tr>`).join("")}</table></div>`;
}
async function addDept() { err(await j("/api/admin/departments", "POST", {code: dc.value, name: dn.value})); show(); }
async function addSlot() { err(await j("/api/admin/slots", "POST", {dept_code: sd.value, room_no: sr.value, day_of_week: sw.value, start_time: st.value, end_time: se.value, subject: ss.value, faculty: sf.value})); show(); }
async function delSlot(id) { await j("/api/admin/slots/" + id, "DELETE"); show(); }
async function upload() {
  const f = new FormData(); f.append("file", csv.files[0]);
  const r = await fetch("/api/admin/timetable/upload", {method: "POST", body: f}).then(r => r.json()); alert(r.error || r.rows + " lectures added"); show();
}
async function reports() {
  const rs = await j("/api/admin/reports");
  return `<div class="scroll"><table><tr><th>Room</th><th>Shown</th><th>Note</th><th>When</th><th></th></tr>${rs.map(r => `<tr><td>${r.room_no}</td><td>${r.shown_status}</td><td>${r.note||""}</td><td>${r.created_at}</td>
  <td><button onclick="j('/api/admin/reports/${r.id}/resolve','POST').then(show)">Resolve</button></td></tr>`).join("") || "<tr><td colspan=5>No open reports.</td></tr>"}</table></div>`;
}
init();
