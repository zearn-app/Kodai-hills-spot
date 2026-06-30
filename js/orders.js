import { db, auth } from "./firebase.js";
import {
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ── HTML escape — prevents XSS when rendering Firestore data ── */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ── Status badge colours ── */
const BADGE = {
  "Order Placed": { bg: "#fff3cd", color: "#856404" },
  "Accepted":     { bg: "#d4edda", color: "#155724" },
  "Dispatched":   { bg: "#cce5ff", color: "#004085" },
  "Received":     { bg: "#d1f0e0", color: "#0a5c36" }
};

onAuthStateChanged(auth, async (user) => {
  const container = document.getElementById("orders");
  if (!container) return;

  if (!user) {
    window.location = "login.html";
    return;
  }

  container.innerHTML = `<p style="color:#aaa;padding:20px;text-align:center;">Loading your orders…</p>`;

  try {
    const q        = query(collection(db, "Orders"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 16px;">
          <div style="font-size:52px;">📦</div>
          <p style="color:#aaa;margin-top:12px;font-size:15px;">No orders yet.</p>
        </div>`;
      return;
    }

    /* Sort newest-first */
    const orders = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.createdAt?.toDate?.() ?? new Date(a.createdAt || 0);
        const tb = b.createdAt?.toDate?.() ?? new Date(b.createdAt || 0);
        return tb - ta;
      });

    /* FIX: escape all Firestore strings with esc() before inserting
       into innerHTML to prevent XSS. Previously used raw interpolation. */
    container.innerHTML = orders.map(data => {
      const status = data.status || "Order Placed";
      const badge  = BADGE[status] || BADGE["Order Placed"];

      let dateStr = "";
      if (data.createdAt) {
        const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }

      const trackingRow = (status === "Dispatched" || status === "Received") && data.trackingId
        ? `<p class="order-tracking">🚚 Tracking ID: <b>${esc(data.trackingId)}</b></p>`
        : "";

      return `
        <div class="order-card">
          <div class="order-top">
            <div>
              <div class="order-product-name">${esc(data.name || "Product")}</div>
              ${dateStr ? `<div class="order-date">${esc(dateStr)}</div>` : ""}
            </div>
            <span class="order-status-badge"
                  style="background:${badge.bg};color:${badge.color};">
              ${esc(status)}
            </span>
          </div>

          <div class="order-meta-row">
            <span>₹${Number(data.grandTotal ?? data.price ?? 0)}</span>
            <span>Qty: ${Number(data.quantity || 1)}</span>
            ${data.pack ? `<span>${esc(data.pack)}</span>` : ""}
          </div>

          ${trackingRow}

          <p class="order-id">Order ID: ${esc(data.id)}</p>
        </div>`;
    }).join("");

  } catch (err) {
    console.error("Orders load error:", err);
    container.innerHTML =
      `<p style="color:#e53935;text-align:center;padding:20px;">
         Failed to load orders. Please try again.
       </p>`;
  }
});
