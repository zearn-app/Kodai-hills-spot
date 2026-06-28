import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let allUsers     = [];
let activeUserId = "";

onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.replace("index.html"); return; }
  if (user.email.trim().toLowerCase() !== "kodaihillsspot@gmail.com") {
    window.location.replace("home.html"); return;
  }
  // Auth passed — reveal page
  document.getElementById("authLoader").style.display = "none";
  document.body.style.display = "block";
  loadUsers();
});

async function loadUsers() {
  const div = document.getElementById("users");
  div.innerHTML = "<p style='color:#aaa;padding:10px;'>Loading…</p>";
  try {
    const snapshot = await getDocs(collection(db, "Users"));
    allUsers = [];
    snapshot.forEach(d => allUsers.push({ id: d.id, ...d.data() }));
    document.getElementById("totalUsers").innerText = allUsers.length;
    showUsers();
  } catch(e) {
    div.innerHTML = `<p style='color:red;padding:10px;'>Error: ${e.message}</p>`;
  }
}

function showUsers() {
  const div    = document.getElementById("users");
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allUsers.filter(u => JSON.stringify(u).toLowerCase().includes(search));

  if (!filtered.length) { div.innerHTML = `<p style='color:#aaa;padding:10px;'>No users found.</p>`; return; }

  div.innerHTML = "";
  filtered.forEach(user => {
    div.innerHTML += `
      <div class="user-card" onclick="window.openUserPopup('${user.id}')">
        <h3>${user.name || user.username || "No Name"}</h3>
        <div class="info">📧 ${user.email || "—"}</div>
        <div class="info">📱 ${user.phone || user.mobile || "—"}</div>
        <div class="uid">ID: ${user.id}</div>
        <button class="del-btn" onclick="event.stopPropagation();window.confirmDelete('${user.id}')">Delete User</button>
      </div>`;
  });
}

window.openUserPopup = (id) => {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  activeUserId = id;

  document.getElementById("popName").innerText = user.name || user.username || "No Name";
  document.getElementById("popId").innerText   = "ID: " + id;
  document.getElementById("popEmail").innerText = user.email || "—";
  document.getElementById("popPhone").innerText = user.phone || user.mobile || "—";

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
    joinedStr = d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  }
  document.getElementById("popJoined").innerText = joinedStr;

  document.getElementById("userPopup").classList.add("open");
};

function closePopup() {
  document.getElementById("userPopup").classList.remove("open");
  activeUserId = "";
}

document.getElementById("popupClose").onclick = closePopup;
document.getElementById("userPopup").onclick = (e) => {
  if (e.target === document.getElementById("userPopup")) closePopup();
};

document.getElementById("popDeleteBtn").onclick = () => {
  if (activeUserId) window.confirmDelete(activeUserId);
};

window.confirmDelete = async (id) => {
  if (!confirm("Delete this user? This cannot be undone.")) return;
  await deleteDoc(doc(db, "Users", id));
  closePopup();
  loadUsers();
};

document.getElementById("searchInput").addEventListener("input", showUsers);
