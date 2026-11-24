const $ = s => document.querySelector(s), dlg = $("#dlg");
const api = (u, o) => fetch(u, o).then(r => r.json());
const post = (u, b) => api(u, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(b)});
const cls = s => s.toLowerCase().replace(" ", "-"), nm = r => /^\d/.test(r.room_no) ? "CR " + r.room_no : r.room_no;
let vacantOnly = false;

async function load() {
  const p = new URLSearchParams({q: $("#q").value, dept: $("#dept").value, min_capacity: $("#cap").value || 0,
    status: vacantOnly ? "Vacant" : $("#status").value});
  const d = await api("/api/rooms?" + p); $("#clock").textContent = d.time;
  $("#grid").innerHTML = d.rooms.length ? d.rooms.map(r => `<button class="tile ${cls(r.status)}" onclick="openRoom(${r.id})">
    <b>${r.room_no}</b><span>${r.status}</span><small>${r.count != null ? `${r.count}/${r.capacity} (${r.pct}%)` : `Capacity ${r.capacity}`}</small>
    <small>${r.depts.join(" · ")}</small></button>`).join("") : `<p class="empty">No rooms match these filters. Clear a filter to see more.</p>`;
}
async function openRoom(id) {
  const r = await api("/api/rooms/" + id);
  dlg.innerHTML = `<div class="sheet ${cls(r.status)}"><button class="x" onclick="dlg.close()" aria-label="Close">×</button>
   <h2>${nm(r)}</h2><span class="badge">${r.status}</span><p>${r.detail}</p>
   <div class="bar"><i style="width:${r.pct || 0}%"></i></div>
   <small>${r.count != null ? `${r.count} of ${r.capacity} seats (${r.pct}%) – approximate` : `Capacity ${r.capacity}`}</small>
   <h3>Today's lectures</h3><ul>${r.schedule.map(s => `<li>${s.time} ${s.subject} (${s.dept})${s.faculty ? " – " + s.faculty : ""}</li>`).join("") || "<li>None scheduled</li>"}</ul>
   <h3>Update this room</h3><div class="row"><input id="cnt" type="number" min="0" max="${r.capacity}" placeholder="Students present">
   <button onclick="send(${id},+cnt.value)">Save update</button><button class="ghost" onclick="send(${id},0)">Room is empty</button></div>
   <p class="msg" id="msg"></p><button class="link" onclick="report(${id})">Report incorrect status</button></div>`;
  dlg.showModal();
}
async function send(id, n) {
  const r = await post(`/api/rooms/${id}/update`, {student_count: n});
  $("#msg").textContent = r.error || "Update saved. It stays valid for 30 minutes."; if (r.ok) { load(); setTimeout(() => openRoom(id), 900); }
}
async function report(id) {
  const note = prompt("What is wrong with this status? (optional)"); if (note === null) return;
  const r = await post(`/api/rooms/${id}/report`, {note}); $("#msg").textContent = r.error || "Report sent to the admin.";
}
(async () => {
  (await api("/api/departments")).forEach(d => $("#dept").insertAdjacentHTML("beforeend", `<option value="${d.code}">${d.code} – ${d.name}</option>`));
  ["q", "dept", "status", "cap"].forEach(i => $("#" + i).addEventListener("input", load));
  $("#vac").onclick = e => { vacantOnly = !vacantOnly; e.target.setAttribute("aria-pressed", vacantOnly); load(); };
  load(); setInterval(load, 60000);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
})();
