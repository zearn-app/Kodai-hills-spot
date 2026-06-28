import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection, getDocs, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const STATUS_OPTIONS = ["Order Placed","Accepted","Dispatched","Received"];

const BADGE = {
  "Order Placed": { bg:"#fff3cd", color:"#856404" },
  "Accepted":     { bg:"#d4edda", color:"#155724" },
  "Dispatched":   { bg:"#cce5ff", color:"#004085" },
  "Received":     { bg:"#d1f0e0", color:"#0a5c36" }
};

// Maps status → chip count element ID
const COUNT_IDS = {
  "Order Placed": "countOrderPlaced",
  "Accepted":     "countAccepted",
  "Dispatched":   "countDispatched",
  "Received":     "countReceived"
};

let allOrders    = [];
let activeFilter = "All";
let searchQuery  = "";

/* ─── Auth ─── */
onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.replace("index.html"); return; }
  if (user.email !== "kodaihillsspot@gmail.com") {
    window.location.replace("home.html"); return;
  }
  document.getElementById("authLoader").style.display = "none";
  document.body.style.display = "block";
  loadOrders();
});

/* ─── Fetch ─── */
async function loadOrders() {
  const div = document.getElementById("allOrders");
  div.innerHTML = "<p style='color:#aaa;padding:10px;'>Loading…</p>";
  try {
    const snapshot = await getDocs(collection(db, "Orders"));
    allOrders = [];
    snapshot.forEach(item => allOrders.push({ id: item.id, ...item.data() }));

    // Newest first
    allOrders.sort((a, b) => {
      const ta = a.createdAt?.toDate?.() ?? new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate?.() ?? new Date(b.createdAt || 0);
      return tb - ta;
    });

    updateCounts();
    renderOrders();
  } catch(e) {
    div.innerHTML = `<p style='color:red;padding:10px;'>Failed: ${e.message}</p>`;
  }
}

/* ─── Count badges with pop animation ─── */
function updateCounts() {
  const counts = { "Order Placed":0, "Accepted":0, "Dispatched":0, "Received":0 };
  allOrders.forEach(o => {
    const s = o.status || "Order Placed";
    if (counts[s] !== undefined) counts[s]++;
  });

  setCount("countAll", allOrders.length);
  Object.entries(COUNT_IDS).forEach(([status, elId]) => {
    setCount(elId, counts[status]);
  });
}

function setCount(elId, value) {
  const el = document.getElementById(elId);
  if (!el) return;
  const prev = el.innerText;
  el.innerText = value;
  if (String(prev) !== String(value)) {
    el.classList.remove("pop");
    void el.offsetWidth; // reflow to restart animation
    el.classList.add("pop");
  }
}

/* ─── Render ─── */
function renderOrders() {
  const div = document.getElementById("allOrders");

  let list = allOrders;

  // Status filter
  if (activeFilter !== "All") {
    list = list.filter(o => (o.status || "Order Placed") === activeFilter);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(o =>
      (o.name        || "").toLowerCase().includes(q) ||
      (o.userName    || "").toLowerCase().includes(q) ||
      (o.userPhone   || o.phone || "").toLowerCase().includes(q) ||
      (o.userEmail   || "").toLowerCase().includes(q) ||
      (o.id          || "").toLowerCase().includes(q) ||
      (o.trackingId  || "").toLowerCase().includes(q)
    );
  }

  // Navbar count
  document.getElementById("orderCount").innerText =
    list.length === allOrders.length
      ? `${allOrders.length} orders`
      : `${list.length} / ${allOrders.length}`;

  if (!list.length) {
    div.innerHTML = `
      <div class="no-results">
        <div>📭</div>
        ${searchQuery ? "No orders match your search." : "No orders in this status."}
      </div>`;
    return;
  }

  // When showing "All", group by status in logical order
  if (activeFilter === "All" && !searchQuery) {
    div.innerHTML = "";
    STATUS_OPTIONS.forEach(status => {
      const group = list.filter(o => (o.status || "Order Placed") === status);
      if (!group.length) return;
      const badge = BADGE[status];
      div.innerHTML += `
        <div class="status-section-header">
          <span class="status-section-label" style="color:${badge.color};">${status} (${group.length})</span>
          <span class="status-section-line"></span>
        </div>`;
      group.forEach(data => div.innerHTML += buildCard(data));
    });
  } else {
    div.innerHTML = list.map(buildCard).join("");
  }
}

/* ─── Build a single order card ─── */
function buildCard(data) {
  const status = data.status || "Order Placed";
  const badge  = BADGE[status] || BADGE["Order Placed"];
  let dateStr  = "";
  if (data.createdAt) {
    const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    dateStr = d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  }
  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-name">${data.name || "Product"}</div>
          ${dateStr ? `<div class="order-date">${dateStr}</div>` : ""}
        </div>
        <span class="status-badge" style="background:${badge.bg};color:${badge.color};">${status}</span>
      </div>
      <p class="order-meta">₹${data.grandTotal ?? data.price ?? 0} &nbsp;|&nbsp; Qty: ${data.quantity || 1}${
        data.pack || data.selectedSize ? ` &nbsp;|&nbsp; ${data.pack || data.selectedSize}` : ""}</p>
      ${data.userName  ? `<p class="order-meta">👤 ${data.userName}</p>` : ""}
      ${(data.userPhone || data.phone) ? `<p class="order-meta">📱 ${data.userPhone || data.phone}</p>` : ""}
      ${data.trackingId ? `<p class="order-meta">🚚 Tracking: <b>${data.trackingId}</b></p>` : ""}
      <p class="order-id">ID: ${data.id}</p>
      <button class="manage-btn" onclick="window._openOrderPopup('${data.id}')">Manage Order</button>
    </div>`;
}

/* ─── Filter chip clicks ─── */
document.getElementById("filterRow").addEventListener("click", (e) => {
  const chip = e.target.closest(".filter-chip");
  if (!chip) return;
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  activeFilter = chip.dataset.status;
  renderOrders();
});

/* ─── Search ─── */
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  document.getElementById("searchClear").style.display = searchQuery ? "block" : "none";
  renderOrders();
});

window.clearSearch = () => {
  document.getElementById("searchInput").value = "";
  searchQuery = "";
  document.getElementById("searchClear").style.display = "none";
  renderOrders();
};

/* ─── Order popup ─── */
let currentOrderId = "";

window._openOrderPopup = (id) => {
  currentOrderId = id;
  const data = allOrders.find(o => o.id === id);
  if (!data) { alert("Order not found"); return; }

  document.getElementById("orderId").innerText     = id;
  document.getElementById("productName").innerText = data.name       || "—";
  document.getElementById("quantity").innerText    = data.quantity   || 1;
  document.getElementById("totalPrice").innerText  = `₹${data.grandTotal ?? data.price ?? 0}`;
  document.getElementById("userName").innerText    = data.userName    || "—";
  document.getElementById("userEmail").innerText   = data.userEmail   || "—";
  document.getElementById("userPhone").innerText   = data.userPhone   || data.phone || "—";
  document.getElementById("userAddress").innerText = data.userAddress || data.address || "—";

  const select = document.getElementById("statusSelect");
  select.innerHTML = STATUS_OPTIONS.map(s =>
    `<option value="${s}" ${s === (data.status || "Order Placed") ? "selected" : ""}>${s}</option>`
  ).join("");

  document.getElementById("trackingId").value = data.trackingId || "";
  toggleTracking(data.status || "Order Placed");
  select.onchange = () => toggleTracking(select.value);

  document.getElementById("statusPopup").style.display = "flex";
};

function toggleTracking(status) {
  const el = document.getElementById("trackingId");
  const show = status === "Dispatched" || status === "Received";
  el.style.display = show ? "block" : "none";
  if (!show) el.value = "";
}

window.closePopup = () => {
  document.getElementById("statusPopup").style.display = "none";
};

// Close popup on overlay tap
document.getElementById("statusPopup").addEventListener("click", (e) => {
  if (e.target === document.getElementById("statusPopup")) window.closePopup();
});

document.getElementById("updateBtn").onclick = async () => {
  const newStatus   = document.getElementById("statusSelect").value;
  const newTracking = document.getElementById("trackingId").value.trim();

  if ((newStatus === "Dispatched" || newStatus === "Received") && !newTracking) {
    alert("Please enter a Tracking ID."); return;
  }
  try {
    const updateData = { status: newStatus, updatedAt: new Date() };
    if (newStatus === "Dispatched" || newStatus === "Received") {
      updateData.trackingId = newTracking;
    }
    await updateDoc(doc(db, "Orders", currentOrderId), updateData);

    // Update local cache instantly — no refetch needed
    const idx = allOrders.findIndex(o => o.id === currentOrderId);
    if (idx !== -1) {
      allOrders[idx].status = newStatus;
      if (newTracking) allOrders[idx].trackingId = newTracking;
    }

    alert(`✅ Order updated to "${newStatus}"!`);
    window.closePopup();
    updateCounts();   // refresh badge counts (with pop animation)
    renderOrders();   // re-render current view
  } catch(e) {
    alert("Update failed: " + e.message);
  }
};
