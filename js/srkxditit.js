import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ── DOM refs ── */
const usersDiv    = document.getElementById("users");
const totalUsers  = document.getElementById("totalUsers");
const searchInput = document.getElementById("searchInput");

let allUsers = [];
let activeUserId = "";

console.log("srkxditit.js Loaded");


/* ==============================
   Auth Check
============================== */

onAuthStateChanged(auth, (user) => {
  console.log("Current User:", user);

  if (!user) {
    usersDiv.innerHTML = "❌ Login Required";
    return;
  }

  if (user.email.trim().toLowerCase() !== "kodaihillsspot@gmail.com") {
    usersDiv.innerHTML = "❌ Admin access denied";
    return;
  }

  loadUsers();
});


/* ==============================
   Load Users
============================== */

async function loadUsers() {
  try {
    usersDiv.innerHTML = "Loading Users...";
    console.log("Fetching Users...");

    const snapshot = await getDocs(collection(db, "Users"));
    console.log("Users:", snapshot.size);

    allUsers = [];
    snapshot.forEach((docSnap) => {
      allUsers.push({ id: docSnap.id, ...docSnap.data() });
    });

    totalUsers.innerText = allUsers.length;
    showUsers();

  } catch (error) {
    console.log(error);
    usersDiv.innerHTML = `<div class="user">❌ ${error.message}</div>`;
  }
}


/* ==============================
   Show / Filter Users
============================== */

function showUsers() {
  usersDiv.innerHTML = "";

  const search   = searchInput.value.toLowerCase();
  const filtered = allUsers.filter((user) =>
    JSON.stringify(user).toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    usersDiv.innerHTML = `<div class="user">No Users Found</div>`;
    return;
  }

  filtered.forEach((user) => {
    usersDiv.innerHTML += `
      <div class="user" onclick="openUserPopup('${user.id}')">
        <h3>${user.name || user.username || "No Name"}</h3>
        <div class="info">📧 ${user.email || "—"}</div>
        <div class="info">📱 ${user.phone || user.mobile || "—"}</div>
        <div class="info" style="font-size:11px;color:#aaa;margin-top:6px;">ID: ${user.id}</div>
        <button class="delete" data-id="${user.id}"
          onclick="event.stopPropagation(); confirmDelete('${user.id}')">
          Delete User
        </button>
      </div>
    `;
  });
}


/* ==============================
   Open User Popup
============================== */

window.openUserPopup = (id) => {
  const user = allUsers.find((u) => u.id === id);
  if (!user) return;

  activeUserId = id;

  document.getElementById("popName").innerText =
    user.name || user.username || "No Name";

  document.getElementById("popId").innerText = "ID: " + id;

  document.getElementById("popEmail").innerText =
    user.email || "—";

  document.getElementById("popPhone").innerText =
    user.phone || user.mobile || "—";

  document.getElementById("popAddress").innerText =
    user.address || user.userAddress || "—";

  /* Format joined date if available */
  let joinedStr = "—";
  if (user.createdAt) {
    const d = user.createdAt.toDate
      ? user.createdAt.toDate()
      : new Date(user.createdAt);
    joinedStr = d.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  }
  document.getElementById("popJoined").innerText = joinedStr;

  document.getElementById("userPopup").classList.add("open");
};


/* ── Close popup ── */
document.getElementById("popupClose").onclick = closePopup;
document.getElementById("userPopup").onclick = (e) => {
  if (e.target === document.getElementById("userPopup")) closePopup();
};

function closePopup() {
  document.getElementById("userPopup").classList.remove("open");
  activeUserId = "";
}


/* ── Delete from popup ── */
document.getElementById("popDeleteBtn").onclick = () => {
  if (activeUserId) confirmDelete(activeUserId);
};


/* ==============================
   Delete User
============================== */

window.confirmDelete = async (id) => {
  if (!confirm("Delete this user? This cannot be undone.")) return;

  await deleteDoc(doc(db, "Users", id));
  closePopup();
  loadUsers();
};


/* ── Search ── */
searchInput.addEventListener("input", showUsers);
