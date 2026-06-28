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

onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.replace("index.html"); return; }
  if (user.email !== "kodaihillsspot@gmail.com") {
    window.location.replace("home.html"); return;
  }
  // Auth passed — reveal page
  document.getElementById("authLoader").style.display = "none";
  document.body.style.display = "block";
  loadOrders();
});

async function loadOrders() {
  const div = document.getElementById("allOrders");
  div.innerHTML = "<p style='color:#aaa;padding:10px;'>Loading…</p>";
  try {
    const snapshot = await getDocs(collection(db, "Orders"));
    if (snapshot.empty) { div.innerHTML = "<p style='color:#aaa;padding:10px;'>No orders yet.</p>"; return; }

    const list = [];
    snapshot.forEach(item => list.push({ id: item.id, ...item.data() }));
    list.sort((a,b) => {
      const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return tb - ta;
    });

    div.innerHTML = "";
    list.forEach(data => {
      const status = data.status || "Order Placed";
      const badge  = BADGE[status] || BADGE["Order Placed"];
      let dateStr  = "";
      if (data.createdAt) {
        const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        dateStr = d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
      }
      div.innerHTML += `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-name">${data.name || "Product"}</div>
              ${dateStr ? `<div class="order-date">${dateStr}</div>` : ""}
            </div>
            <span class="status-badge" style="background:${badge.bg};color:${badge.color};">${status}</span>
          </div>
          <p class="order-meta">₹${data.grandTotal || data.price || 0} &nbsp;|&nbsp; Qty: ${data.quantity || 1}
            ${data.pack || data.selectedSize ? `&nbsp;|&nbsp; ${data.pack || data.selectedSize}` : ""}
          </p>
          ${data.userPhone || data.phone ? `<p class="order-meta">📱 ${data.userPhone || data.phone}</p>` : ""}
          ${data.trackingId ? `<p class="order-meta">🚚 Tracking: <b>${data.trackingId}</b></p>` : ""}
          <p class="order-id">ID: ${data.id}</p>
          <button class="manage-btn" onclick="window._openOrderPopup('${data.id}')">Manage Order</button>
        </div>`;
    });
  } catch(e) {
    div.innerHTML = `<p style='color:red;padding:10px;'>Failed: ${e.message}</p>`;
  }
}

let currentOrderId = "";

window._openOrderPopup = async (id) => {
  currentOrderId = id;
  const snap = await getDocs(collection(db, "Orders"));
  let data = null;
  snap.forEach(item => { if (item.id === id) data = item.data(); });
  if (!data) { alert("Order not found"); return; }

  document.getElementById("orderId").innerText     = id;
  document.getElementById("productName").innerText = data.name       || "—";
  document.getElementById("quantity").innerText    = data.quantity   || 1;
  document.getElementById("totalPrice").innerText  = `₹${data.grandTotal || data.price || 0}`;
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
  if (status === "Dispatched" || status === "Received") {
    el.style.display = "block";
  } else {
    el.style.display = "none";
    el.value = "";
  }
}

window.closePopup = () => {
  document.getElementById("statusPopup").style.display = "none";
};

document.getElementById("updateBtn").onclick = async () => {
  const newStatus   = document.getElementById("statusSelect").value;
  const newTracking = document.getElementById("trackingId").value.trim();

  if ((newStatus === "Dispatched" || newStatus === "Received") && !newTracking) {
    alert("Please enter a Tracking ID."); return;
  }
  try {
    const updateData = { status: newStatus, updatedAt: new Date() };
    if (newStatus === "Dispatched" || newStatus === "Received") updateData.trackingId = newTracking;
    await updateDoc(doc(db, "Orders", currentOrderId), updateData);
    alert(`✅ Order updated to "${newStatus}"!`);
    window.closePopup();
    loadOrders();
  } catch(e) { alert("Update failed: " + e.message); }
};
