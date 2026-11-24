const $ = s => document.querySelector(s);
const dlg = $("#dlg");
const dlgProfile = $("#dlg-profile");

const api = (u, o) => fetch(u, o).then(r => r.json());
const post = (u, b) => api(u, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(b)
});

const cls = s => s.toLowerCase().replace(" ", "-");
const nm = r => /^\d/.test(r.room_no) ? "CR " + r.room_no : r.room_no;

let vacantOnly = false;
let currentStudent = null;
let refreshTimer = null;

/* ---------------- View Navigation ---------------- */
function showView(viewId) {
  ["welcome", "login", "app"].forEach(v => {
    const el = $("#view-" + v);
    if (el) el.style.display = (v === viewId) ? "block" : "none";
  });
  window.scrollTo(0, 0);
}

/* ---------------- Profile & Session Management ---------------- */
function setProfileUI(student) {
  currentStudent = student;
  if (!student) return;
  const nameEl = $("#profile-name");
  const idEl = $("#profile-id");
  const modalName = $("#modal-student-name");
  const modalId = $("#modal-student-id");

  if (nameEl) nameEl.textContent = student.name;
  if (idEl) idEl.textContent = student.identifier;
  if (modalName) modalName.textContent = student.name;
  if (modalId) modalId.textContent = student.identifier;
}

function enterApp() {
  showView("app");
  load();
  if (!refreshTimer) {
    refreshTimer = setInterval(load, 60000);
  }
}

async function checkSession() {
  try {
    // 1. Verify with backend session
    const res = await api("/api/student/me");
    if (res && res.logged_in && res.student) {
      localStorage.setItem("campusspace_student", JSON.stringify(res.student));
      setProfileUI(res.student);
      enterApp();
      return;
    }

    // 2. Fallback to cached localStorage
    const cached = localStorage.getItem("campusspace_student");
    if (cached) {
      try {
        const student = JSON.parse(cached);
        if (student && student.name && student.identifier) {
          const reLog = await post("/api/student/login", student);
          if (reLog && reLog.ok && reLog.student) {
            setProfileUI(reLog.student);
            enterApp();
            return;
          }
        }
      } catch (e) { }
      localStorage.removeItem("campusspace_student");
    }
  } catch (err) {
    console.warn("Session check notice:", err);
  }

  showView("welcome");
}

function showLoginError(msg) {
  const el = $("#login-error");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

async function handleStudentLogin(e) {
  if (e) e.preventDefault();
  const errEl = $("#login-error");
  if (errEl) {
    errEl.style.display = "none";
    errEl.textContent = "";
  }

  const nameInput = $("#student-name");
  const idInput = $("#student-id");
  const name = (nameInput ? nameInput.value : "").trim();
  const identifier = (idInput ? idInput.value : "").trim();

  // Basic client-side validation
  if (!name) {
    showLoginError("Student full name is mandatory.");
    if (nameInput) nameInput.focus();
    return;
  }
  if (!identifier) {
    showLoginError("Please enter either your roll number or email address.");
    if (idInput) idInput.focus();
    return;
  }
  if (identifier.includes("@") && !/^\S+@\S+\.\S+$/.test(identifier)) {
    showLoginError("Please enter a valid email address (e.g. name@college.edu).");
    if (idInput) idInput.focus();
    return;
  }

  const btn = $("#btn-login-submit");
  if (btn) btn.disabled = true;

  try {
    const res = await post("/api/student/login", { name, identifier });
    if (res && res.ok && res.student) {
      localStorage.setItem("campusspace_student", JSON.stringify(res.student));
      setProfileUI(res.student);
      enterApp();
    } else {
      showLoginError(res.error || "Login failed. Please check your inputs.");
    }
  } catch (err) {
    showLoginError("Network connection error. Please try again.");
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleStudentLogout() {
  try {
    await post("/api/student/logout", {});
  } catch (e) { }

  localStorage.removeItem("campusspace_student");
  currentStudent = null;

  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  if (dlgProfile && dlgProfile.open) {
    dlgProfile.close();
  }

  const nameInput = $("#student-name");
  const idInput = $("#student-id");
  if (nameInput) nameInput.value = "";
  if (idInput) idInput.value = "";

  const errEl = $("#login-error");
  if (errEl) errEl.style.display = "none";

  showView("welcome");
}

/* ---------------- Existing Classroom Core Logic ---------------- */
async function load() {
  const qEl = $("#q"), deptEl = $("#dept"), capEl = $("#cap"), statusEl = $("#status");
  const p = new URLSearchParams({
    q: qEl ? qEl.value : "",
    dept: deptEl ? deptEl.value : "",
    min_capacity: (capEl ? capEl.value : 0) || 0,
    status: vacantOnly ? "Vacant" : (statusEl ? statusEl.value : "")
  });

  try {
    const d = await api("/api/rooms?" + p);
    const clockEl = $("#clock");
    if (clockEl) clockEl.textContent = d.time;

    const gridEl = $("#grid");
    if (gridEl) {
      gridEl.innerHTML = d.rooms.length ? d.rooms.map(r => `
        <button class="tile ${cls(r.status)}" onclick="openRoom(${r.id})">
          <b>${r.room_no}</b>
          <span>${r.status}</span>
          <small>${r.count != null ? `${r.count}/${r.capacity} (${r.pct}%)` : `Capacity ${r.capacity}`}</small>
          <small>${r.depts.join(" · ")}</small>
        </button>
      `).join("") : `<p class="empty">No rooms match these filters. Clear a filter to see more.</p>`;
    }
  } catch (e) {
    console.error("Failed to load rooms:", e);
  }
}

async function openRoom(id) {
  try {
    const r = await api("/api/rooms/" + id);
    if (!dlg) return;
    dlg.innerHTML = `
      <div class="sheet ${cls(r.status)}">
        <button class="x" onclick="document.querySelector('#dlg').close()" aria-label="Close">×</button>
        <h2>${nm(r)}</h2>
        <span class="badge">${r.status}</span>
        <p>${r.detail}</p>
        <div class="bar"><i style="width:${r.pct || 0}%"></i></div>
        <small>${r.count != null ? `${r.count} of ${r.capacity} seats (${r.pct}%) – approximate` : `Capacity ${r.capacity}`}</small>
        <h3>Today's lectures</h3>
        <ul>${r.schedule.map(s => `<li>${s.time} ${s.subject} (${s.dept})${s.faculty ? " – " + s.faculty : ""}</li>`).join("") || "<li>None scheduled</li>"}</ul>
        <h3>Update this room</h3>
        <div class="row">
          <input id="cnt" type="number" min="0" max="${r.capacity}" placeholder="Students present">
          <button onclick="send(${id},+document.querySelector('#cnt').value)">Save update</button>
          <button class="ghost" onclick="send(${id},0)">Room is empty</button>
        </div>
        <p class="msg" id="msg"></p>
        <button class="link" onclick="report(${id})">Report incorrect status</button>
      </div>
    `;
    dlg.showModal();
  } catch (e) {
    console.error("Failed to open room:", e);
  }
}

async function send(id, n) {
  const r = await post(`/api/rooms/${id}/update`, { student_count: n });
  const msgEl = $("#msg");
  if (msgEl) msgEl.textContent = r.error || "Update saved. It stays valid for 30 minutes.";
  if (r.ok) {
    load();
    setTimeout(() => openRoom(id), 900);
  }
}

async function report(id) {
  const note = prompt("What is wrong with this status? (optional)");
  if (note === null) return;
  const r = await post(`/api/rooms/${id}/report`, { note });
  const msgEl = $("#msg");
  if (msgEl) msgEl.textContent = r.error || "Report sent to the admin.";
}

/* ---------------- Application Initialization ---------------- */
(async () => {
  // 1. Setup departments dropdown
  try {
    const depts = await api("/api/departments");
    const deptSelect = $("#dept");
    if (deptSelect) {
      depts.forEach(d => {
        deptSelect.insertAdjacentHTML("beforeend", `<option value="${d.code}">${d.code} – ${d.name}</option>`);
      });
    }
  } catch (e) {
    console.warn("Failed to load departments:", e);
  }

  // 2. Setup filter input listeners
  ["q", "dept", "status", "cap"].forEach(i => {
    const el = $("#" + i);
    if (el) el.addEventListener("input", load);
  });

  const vacBtn = $("#vac");
  if (vacBtn) {
    vacBtn.onclick = e => {
      vacantOnly = !vacantOnly;
      e.target.setAttribute("aria-pressed", vacantOnly);
      load();
    };
  }

  // 3. Navigation and event listeners
  const getStartedBtn = $("#btn-get-started");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
      showView("login");
      const errEl = $("#login-error");
      if (errEl) errEl.style.display = "none";
      const nameInput = $("#student-name");
      if (nameInput) nameInput.focus();
    });
  }

  const loginBackBtn = $("#btn-login-back");
  if (loginBackBtn) {
    loginBackBtn.addEventListener("click", () => {
      showView("welcome");
    });
  }

  const loginForm = $("#student-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleStudentLogin);
  }

  // Profile modal and logout buttons
  const profilePillBtn = $("#profile-pill-btn");
  if (profilePillBtn) {
    profilePillBtn.addEventListener("click", () => {
      if (dlgProfile) dlgProfile.showModal();
    });
  }

  const headerLogoutBtn = $("#btn-header-logout");
  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener("click", handleStudentLogout);
  }

  const modalLogoutBtn = $("#btn-modal-logout");
  if (modalLogoutBtn) {
    modalLogoutBtn.addEventListener("click", handleStudentLogout);
  }

  // 4. Check initial session and show appropriate view
  checkSession();

  // 5. PWA Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(e => console.warn("SW registration:", e));
  }
})();
