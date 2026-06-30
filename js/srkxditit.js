import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ── HTML escape — prevents XSS when rendering Firestore data ── */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let allUsers     = [];
let activeUserId = "";

/* ── Auth guard ── */
onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.replace("index.html"); return; }
  if (user.email.trim().toLowerCase() !== "kodaihillsspot@gmail.com") {
    window.location.replace("home.html"); return;
  }
  document.getElementById("authLoader").style.display = "none";
  document.body.style.display = "block";
  loadUsers();
});

/* ── Load all users ── */
async function loadUsers() {
  const div = document.getElementById("users");
  div.innerHTML = "<p style='color:#aaa;padding:10px;'>Loading…</p>";
  try {
    const snapshot = await getDocs(collection(db, "Users"));
    allUsers = [];
    snapshot.forEach(d => allUsers.push({ id: d.id, ...d.data() }));
    document.getElementById("totalUsers").innerText = allUsers.length;
    showUsers();
  } catch (e) {
    /* FIX: escape error message before rendering */
    div.innerHTML = `<p style='color:red;padding:10px;'>Error: ${esc(e.message)}</p>`;
  }
}

/* ── Filter & render ── */
function showUsers() {
  const div    = document.getElementById("users");
  const search = document.getElementById("searchInput").value.trim().toLowerCase();

  /* FIX: was JSON.stringify(u) — now searches only specific safe fields.
     JSON.stringify exposed internal field names and all data as searchable text. */
  const filtered = search
    ? allUsers.filter(u =>
        (u.name     || "").toLowerCase().includes(search) ||
        (u.username || "").toLowerCase().includes(search) ||
        (u.email    || "").toLowerCase().includes(search) ||
        (u.phone    || "").toLowerCase().includes(search) ||
        (u.mobile   || "").toLowerCase().includes(search)
      )
    : allUsers;

  if (!filtered.length) {
    div.innerHTML = `<p style='color:#aaa;padding:10px;'>No users found.</p>`;
    return;
  }

  /* FIX: escape all Firestore strings with esc() before inserting into innerHTML.
     Previously user.name, user.email etc. were inserted raw — XSS risk. */
  div.innerHTML = filtered.map(user => `
    <div class="user-card" data-id="${esc(user.id)}">
      <h3>${esc(user.name || user.username || "No Name")}</h3>
      <div class="info">📧 ${esc(user.email || "—")}</div>
      <div class="info">📱 ${esc(user.phone || user.mobile || "—")}</div>
      <div class="uid">ID: ${esc(user.id)}</div>
      <button class="del-btn" data-del="${esc(user.id)}">Delete User</button>
    </div>`
  ).join("");

  /* FIX: use event delegation with data-attributes instead of inline onclick
     with raw user.id — prevents attribute injection if ID has special chars */
  div.querySelectorAll(".user-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".del-btn")) return; // handled separately
      window.openUserPopup(card.dataset.id);
    });
  });

  div.querySelectorAll(".del-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.confirmDelete(btn.dataset.del);
    });
  });
}

/* ── User detail popup ── */
window.openUserPopup = (id) => {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  activeUserId = id;

  /* FIX: use innerText (not innerHTML) for all user data — no XSS possible */
  document.getElementById("popName").innerText    = user.name || user.username || "No Name";
  document.getElementById("popId").innerText      = "ID: " + id;
  document.getElementById("popEmail").innerText   = user.email  || "—";
  document.getElementById("popPhone").innerText   = user.phone  || user.mobile || "—";

  const addr = user.address || user.userAddress;
  let addressStr = "—";
  if (addr && typeof addr === "object") {
    const parts = [addr.street, addr.area, addr.district, addr.state, addr.pincode].filter(Boolean);
    addressStr = parts.length ? parts.join(", ") : "—";
  } else if (typeof addr === "string" && addr) {
    addressStr = addr;
  }
  document.getElementById("popAddress").innerText = addressStr;

  let joinedStr = "—";
  if (user.createdAt) {
    const d = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
    joinedStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  document.getElementById("popJoined").innerText = joinedStr;

  document.getElementById("userPopup").classList.add("open");
};

/* ── Close popup ── */
function closePopup() {
  document.getElementById("userPopup").classList.remove("open");
  activeUserId = "";
}

document.getElementById("popupClose").onclick = closePopup;
document.getElementById("userPopup").addEventListener("click", (e) => {
  if (e.target === document.getElementById("userPopup")) closePopup();
});

document.getElementById("popDeleteBtn").onclick = () => {
  if (activeUserId) window.confirmDelete(activeUserId);
};

/* ── Delete user ── */
window.confirmDelete = async (id) => {
  if (!confirm("Delete this user? This cannot be undone.")) return;
  try {
    await deleteDoc(doc(db, "Users", id));
    closePopup();
    loadUsers();
  } catch (e) {
    alert("Delete failed: " + e.message);
  }
};

document.getElementById("searchInput").addEventListener("input", showUsers);
