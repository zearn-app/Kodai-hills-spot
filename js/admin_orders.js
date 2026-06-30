import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection, getDocs, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ── HTML escape — prevents XSS when rendering Firestore data ── */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const STATUS_OPTIONS = ["Order Placed", "Accepted", "Dispatched", "Received"];

const BADGE = {
  "Order Placed": { bg: "#fff3cd", color: "#856404" },
  "Accepted":     { bg: "#d4edda", color: "#155724" },
  "Dispatched":   { bg: "#cce5ff", color: "#004085" },
  "Received":     { bg: "#d1f0e0", color: "#0a5c36" }
};

const COUNT_IDS = {
  "Order Placed": "countOrderPlaced",
  "Accepted":     "countAccepted",
  "Dispatched":   "countDispatched",
  "Received":     "countReceived"
};

let allOrders    = [];
let activeFilter = "All";
let searchQuery  = "";

/* ── Customer field helpers — support both new and legacy field names ── */
function getCustomerName(o)    { return o.customerName || o.userName || "—"; }
function getCustomerEmail(o)   { return o.email || o.userEmail || "—"; }
function getCustomerPhone(o)   { return o.phone || o.userPhone || "—"; }
function getCustomerAddress(o) {
  const parts = [o.street, o.area, o.district, o.state, o.pincode].filter(Boolean);
  if (parts.length) return parts.join(", ");
  return o.userAddress || o.address || "—";
}

/* ── Auth guard ── */
onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.replace("index.html"); return; }
  if (user.email !== "kodaihillsspot@gmail.com") {
    window.location.replace("home.html"); return;
  }
  document.getElementById("authLoader").style.display = "none";
  document.body.style.display = "block";
  loadOrders();
});

/* ── Fetch orders ── */
async function loadOrders() {
  const div = document.getElementById("allOrders");
  div.innerHTML = "<p style='color:#aaa;padding:10px;'>Loading…</p>";
  try {
    const snapshot = await getDocs(collection(db, "Orders"));
    allOrders = [];
    snapshot.forEach(item => allOrders.push({ id: item.id, ...item.data() }));

    /* Sort newest first */
    allOrders.sort((a, b) => {
      const ta = a.createdAt?.toDate?.() ?? new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate?.() ?? new Date(b.createdAt || 0);
      return tb - ta;
    });

    updateCounts();
    renderOrders();
  } catch (e) {
    div.innerHTML = `<p style='color:red;padding:10px;'>Failed: ${esc(e.message)}</p>`;
  }
}

/* ── Count badges ── */
function updateCounts() {
  const counts = { "Order Placed": 0, "Accepted": 0, "Dispatched": 0, "Received": 0 };
  allOrders.forEach(o => {
    const s = o.status || "Order Placed";
    if (counts[s] !== undefined) counts[s]++;
  });
  setCount("countAll", allOrders.length);
  Object.entries(COUNT_IDS).forEach(([status, elId]) => setCount(elId, counts[status]));
}

function setCount(elId, value) {
  const el = document.getElementById(elId);
  if (!el) return;
  const prev = el.innerText;
  el.innerText = value;
  if (String(prev) !== String(value)) {
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }
}

/* ── Render orders ── */
function renderOrders() {
  const div = document.getElementById("allOrders");

  let list = allOrders;

  if (activeFilter !== "All") {
    list = list.filter(o => (o.status || "Order Placed") === activeFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(o =>
      (o.name              || "").toLowerCase().includes(q) ||
      getCustomerName(o).toLowerCase().includes(q)         ||
      getCustomerPhone(o).toLowerCase().includes(q)        ||
      getCustomerEmail(o).toLowerCase().includes(q)        ||
      (o.id                || "").toLowerCase().includes(q) ||
      (o.trackingId        || "").toLowerCase().includes(q)
    );
  }

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

  /* Group by status when showing "All" */
  if (activeFilter === "All" && !searchQuery) {
    div.innerHTML = "";
    STATUS_OPTIONS.forEach(status => {
      const group = list.filter(o => (o.status || "Order Placed") === status);
      if (!group.length) return;
      const badge = BADGE[status];
      /* FIX: escape status string in header */
      div.innerHTML += `
        <div class="status-section-header">
          <span class="status-section-label" style="color:${badge.color};">
            ${esc(status)} (${group.length})
          </span>
          <span class="status-section-line"></span>
        </div>`;
      group.forEach(data => div.innerHTML += buildCard(data));
    });

    /* Catch orders with unexpected status values */
    const unknown = list.filter(o =>
      o.status && !STATUS_OPTIONS.includes(o.status)
    );
    if (unknown.length) {
      console.warn("Orders with unrecognized status:", unknown.map(o => ({ id: o.id, status: o.status })));
      div.innerHTML += `
        <div class="status-section-header">
          <span class="status-section-label" style="color:#e53935;">
            Unknown Status (${unknown.length})
          </span>
          <span class="status-section-line"></span>
        </div>`;
      unknown.forEach(data => div.innerHTML += buildCard(data));
    }
  } else {
    div.innerHTML = list.map(buildCard).join("");
  }
}

/* ── Build a single order card ── */
function buildCard(data) {
  const status = data.status || "Order Placed";
  const badge  = BADGE[status] || BADGE["Order Placed"];

  let dateStr = "";
  if (data.createdAt) {
    const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  const custName  = getCustomerName(data);
  const custPhone = getCustomerPhone(data);

  /* FIX: all Firestore-derived strings escaped with esc() before innerHTML insertion */
  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-name">${esc(data.name || "Product")}</div>
          ${dateStr ? `<div class="order-date">${esc(dateStr)}</div>` : ""}
        </div>
        <span class="status-badge" style="background:${badge.bg};color:${badge.color};">
          ${esc(status)}
        </span>
      </div>
      <p class="order-meta">
        ₹${Number(data.grandTotal ?? data.price ?? 0)}
        &nbsp;|&nbsp; Qty: ${Number(data.quantity || 1)}
        ${data.pack || data.selectedSize
          ? ` &nbsp;|&nbsp; ${esc(data.pack || data.selectedSize)}`
          : ""}
      </p>
      ${custName  !== "—" ? `<p class="order-meta">👤 ${esc(custName)}</p>`  : ""}
      ${custPhone !== "—" ? `<p class="order-meta">📱 ${esc(custPhone)}</p>` : ""}
      ${data.trackingId
        ? `<p class="order-meta">🚚 Tracking: <b>${esc(data.trackingId)}</b></p>`
        : ""}
      <p class="order-id">ID: ${esc(data.id)}</p>
      <button class="manage-btn" data-orderid="${esc(data.id)}">Manage Order</button>
    </div>`;
}

/* FIX: use event delegation on the container instead of inline onclick="window._openOrderPopup(...)"
   This avoids attribute-injection risk if order IDs ever contain special characters. */
document.getElementById("allOrders").addEventListener("click", (e) => {
  const btn = e.target.closest(".manage-btn");
  if (!btn) return;
  window._openOrderPopup(btn.dataset.orderid);
});

/* ── Filter chips ── */
document.getElementById("filterRow").addEventListener("click", (e) => {
  const chip = e.target.closest(".filter-chip");
  if (!chip) return;
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  activeFilter = chip.dataset.status;
  renderOrders();
});

/* ── Search ── */
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

/* ── Order popup ── */
let currentOrderId = "";

window._openOrderPopup = (id) => {
  currentOrderId = id;
  const data = allOrders.find(o => o.id === id);
  if (!data) { alert("Order not found"); return; }

  /* FIX: use innerText for all user-derived values — no XSS possible via popup */
  document.getElementById("orderId").innerText     = id;
  document.getElementById("productName").innerText = data.name || "—";
  document.getElementById("quantity").innerText    = data.quantity || 1;
  document.getElementById("totalPrice").innerText  = `₹${data.grandTotal ?? data.price ?? 0}`;
  document.getElementById("userName").innerText    = getCustomerName(data);
  document.getElementById("userEmail").innerText   = getCustomerEmail(data);
  document.getElementById("userPhone").innerText   = getCustomerPhone(data);
  document.getElementById("userAddress").innerText = getCustomerAddress(data);

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
  const el   = document.getElementById("trackingId");
  const show = status === "Dispatched" || status === "Received";
  el.style.display = show ? "block" : "none";
  if (!show) el.value = "";
}

window.closePopup = () => {
  document.getElementById("statusPopup").style.display = "none";
};

document.getElementById("statusPopup").addEventListener("click", (e) => {
  if (e.target === document.getElementById("statusPopup")) window.closePopup();
});

/* ── Update order status ── */
document.getElementById("updateBtn").onclick = async () => {
  const newStatus   = document.getElementById("statusSelect").value;
  const newTracking = document.getElementById("trackingId").value.trim();

  if ((newStatus === "Dispatched" || newStatus === "Received") && !newTracking) {
    alert("Please enter a Tracking ID.");
    return;
  }

  try {
    const updateData = { status: newStatus, updatedAt: new Date() };
    if (newStatus === "Dispatched" || newStatus === "Received") {
      updateData.trackingId = newTracking;
    }
    await updateDoc(doc(db, "Orders", currentOrderId), updateData);

    /* Update local cache instantly — no refetch needed */
    const idx = allOrders.findIndex(o => o.id === currentOrderId);
    if (idx !== -1) {
      allOrders[idx].status = newStatus;
      if (newTracking) allOrders[idx].trackingId = newTracking;
    }

    alert(`✅ Order updated to "${newStatus}"!`);
    window.closePopup();
    updateCounts();
    renderOrders();
  } catch (e) {
    alert("Update failed: " + e.message);
  }
};
