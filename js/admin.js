import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getCountFromServer,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ── DOM refs ── */
const productsDiv    = document.getElementById("products");
const ordersDiv      = document.getElementById("allOrders");
const enableVariants = document.getElementById("enableVariants");
const variantSection = document.getElementById("variantSection");
const variantFields  = document.getElementById("variantFields");
const addVariantBtn  = document.getElementById("addVariantBtn");

/* ── Status options ── */
const STATUS_OPTIONS = [
  "Order Placed",
  "Accepted",
  "Dispatched",
  "Received"
];

/* ── Default categories (fallback, cannot be deleted) ── */
const DEFAULT_CATEGORIES = [
  "Chocolate",
  "Honey",
  "Herbs",
  "Oils",
  "Fruits",
  "Organic Products"
];


/* ==============================
   Categories — Firestore helpers
============================== */

const CAT_DOC = doc(db, "Categories", "list");

async function getCategories() {
  try {
    const snap = await getDoc(CAT_DOC);
    if (snap.exists() && snap.data().items?.length) {
      return snap.data().items;
    }
    return DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

async function saveCategories(items) {
  await setDoc(CAT_DOC, { items });
}

async function populateCategorySelect(selectEl, selectedValue) {
  if (!selectEl) return;
  const cats = await getCategories();
  selectEl.innerHTML = cats
    .map(c => `<option value="${c}" ${c === selectedValue ? "selected" : ""}>${c}</option>`)
    .join("");
}

async function loadCategoryChips() {
  try {
    const cats  = await getCategories();
    const chips = document.getElementById("categoryChips");
    if (!chips) return;
    chips.innerHTML = "";

    cats.forEach(cat => {
      const isDefault = DEFAULT_CATEGORIES.map(d => d.toLowerCase()).includes(cat.toLowerCase());
      const chip = document.createElement("span");
      chip.className = `category-chip${isDefault ? " builtin" : ""}`;
      chip.innerHTML = `
        ${cat}
        ${isDefault ? "" : `<button class="chip-delete" title="Delete" onclick="deleteCategory('${cat}')">✕</button>`}
      `;
      chips.appendChild(chip);
    });

    await populateCategorySelect(document.getElementById("category"));
    await populateCategorySelect(document.getElementById("editCategory"));
  } catch (err) {
    console.error("loadCategoryChips:", err);
  }
}


/* ==============================
   Add Category
============================== */

document.getElementById("addCategoryBtn").onclick = async () => {
  const input = document.getElementById("newCategoryInput");
  const name  = input.value.trim();
  if (!name) { alert("Enter a category name."); return; }

  const cats = await getCategories();
  if (cats.some(c => c.toLowerCase() === name.toLowerCase())) {
    alert("This category already exists.");
    return;
  }

  cats.push(name);
  await saveCategories(cats);
  input.value = "";
  await loadCategoryChips();
};

document.getElementById("newCategoryInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("addCategoryBtn").click();
});


/* ==============================
   Delete Category
============================== */

window.deleteCategory = async (name) => {
  if (!confirm(`Delete category "${name}"?`)) return;
  const cats    = await getCategories();
  const updated = cats.filter(c => c !== name);
  await saveCategories(updated);
  await loadCategoryChips();
};


/* ==============================
   Users Button
============================== */

document.getElementById("userBtn").onclick = () => {
  window.location = "srkxditit.html";
};


/* ==============================
   Quantity Variant Toggle
============================== */

enableVariants.onchange = () => {
  if (enableVariants.checked) {
    variantSection.style.display = "block";
    document.getElementById("packQty").style.display = "none";
  } else {
    variantSection.style.display = "none";
    document.getElementById("packQty").style.display = "block";
    variantFields.innerHTML = "";
  }
};


/* ==============================
   Add Variant Row
============================== */

addVariantBtn.onclick = () => {
  const div = document.createElement("div");
  div.style.marginBottom = "10px";
  div.innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <input class="variantQty"   placeholder="500g / 1kg" style="flex:1">
      <input class="variantPrice" placeholder="Price" type="number" style="flex:1">
      <button class="removeVariant"
        style="width:60px;background:red;color:white;border:none;border-radius:10px;">✖</button>
    </div>
  `;
  variantFields.appendChild(div);
  div.querySelector(".removeVariant").onclick = () => div.remove();
};


/* ==============================
   Admin Auth Check
============================== */

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location = "index.html"; return; }
  if (user.email !== "kodaihillsspot@gmail.com") {
    alert("Access denied");
    window.location = "home.html";
    return;
  }

  /* Run all independently so one failure never blocks others */
  loadStats().catch(e  => console.error("loadStats:", e));
  loadProducts().catch(e => console.error("loadProducts:", e));
  loadOrders().catch(e  => console.error("loadOrders:", e));
  loadCategoryChips().catch(e => console.error("loadCategoryChips:", e));
});


/* ==============================
   Add Product
============================== */

document.getElementById("addBtn").onclick = async () => {
  try {
    const name         = document.getElementById("name").value.trim();
    const price        = document.getElementById("price").value.trim();
    const oldPrice     = document.getElementById("oldPrice").value.trim();
    const packQty      = document.getElementById("packQty").value.trim();
    const category     = document.getElementById("category").value;
    const image        = document.getElementById("image").value.trim();
    const description  = document.getElementById("description").value.trim();
    const fewStock     = document.getElementById("fewStock").checked;
    const freeDelivery = document.getElementById("freeDelivery").checked;

    if (!name || !price || !image || !description) {
      alert("Fill all fields");
      return;
    }

    let quantityVariants = [];
    const qtyInputs   = document.querySelectorAll(".variantQty");
    const priceInputs = document.querySelectorAll(".variantPrice");

    for (let i = 0; i < qtyInputs.length; i++) {
      const qty    = qtyInputs[i].value.trim();
      const vPrice = priceInputs[i].value.trim();
      if (qty && vPrice) quantityVariants.push({ qty, price: Number(vPrice) });
    }

    await addDoc(collection(db, "Products"), {
      name,
      price:        Number(price),
      oldPrice:     oldPrice ? Number(oldPrice) : null,
      packQty:      enableVariants.checked ? "" : packQty,
      quantityVariants,
      category,
      Image:        image,
      description,
      fewStock,
      freeDelivery
    });

    alert("Product Added Successfully");

    document.getElementById("name").value        = "";
    document.getElementById("price").value       = "";
    document.getElementById("oldPrice").value    = "";
    document.getElementById("packQty").value     = "";
    document.getElementById("image").value       = "";
    document.getElementById("description").value = "";
    document.getElementById("fewStock").checked      = false;
    document.getElementById("freeDelivery").checked  = false;
    enableVariants.checked       = false;
    variantFields.innerHTML      = "";
    variantSection.style.display = "none";
    document.getElementById("packQty").style.display = "block";

    loadProducts();
    loadStats();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


/* ==============================
   Load Products
============================== */

async function loadProducts() {
  productsDiv.innerHTML = "Loading...";
  try {
    const snapshot = await getDocs(collection(db, "Products"));
    productsDiv.innerHTML = "";

    if (snapshot.empty) {
      productsDiv.innerHTML = "<p style='padding:20px;color:#aaa;'>No products yet.</p>";
      return;
    }

    snapshot.forEach((item) => {
      const data = item.data();

      let quantityDisplay = "";
      if (data.quantityVariants && data.quantityVariants.length > 0) {
        quantityDisplay = data.quantityVariants
          .map(q => `<span style="display:inline-block;padding:5px 10px;background:#f5f5f5;margin:4px;border-radius:10px;font-size:13px;">${q.qty} — ₹${q.price}</span>`)
          .join("");
      } else {
        quantityDisplay = `<span style="font-size:13px;color:#555;">${data.packQty || "—"}</span>`;
      }

      const deliveryBadge = data.freeDelivery
        ? `<span style="display:inline-block;padding:4px 10px;background:#e8f5e9;color:#2e7d32;border-radius:20px;font-size:12px;font-weight:bold;margin-top:6px;">🚚 Free Delivery</span>`
        : `<span style="display:inline-block;padding:4px 10px;background:#fce4ec;color:#c62828;border-radius:20px;font-size:12px;font-weight:bold;margin-top:6px;">🚚 ₹50 Delivery</span>`;

      const stockBadge = data.fewStock
        ? `<span style="display:inline-block;padding:4px 10px;background:#fff3e0;color:#e65100;border-radius:20px;font-size:12px;font-weight:bold;margin-top:6px;margin-left:6px;">⚠️ Few Stock</span>`
        : "";

      productsDiv.innerHTML += `
        <div style="background:white;padding:15px;margin-bottom:15px;border-radius:15px;box-shadow:0 2px 8px rgba(0,0,0,.07);">
          <img src="${data.Image}" style="width:100%;height:150px;object-fit:cover;border-radius:10px;" onerror="this.src='logo.png'">
          <h3 style="margin-top:10px;margin-bottom:4px;">${data.name}</h3>
          <p style="color:#2e7d32;font-weight:700;margin-bottom:4px;">₹${data.price}
            ${data.oldPrice ? `<span style="color:#aaa;font-weight:400;text-decoration:line-through;font-size:13px;margin-left:6px;">₹${data.oldPrice}</span>` : ""}
          </p>
          <p style="margin-bottom:6px;">${quantityDisplay}</p>
          <p style="font-size:12px;color:#888;margin-bottom:6px;">📂 ${data.category || "—"}</p>
          ${deliveryBadge}${stockBadge}
          <br>
          <button onclick="editProduct('${item.id}')"
            style="background:#2196f3;color:white;padding:10px 16px;border:none;border-radius:10px;margin-right:10px;margin-top:12px;cursor:pointer;font-size:14px;">
            ✏️ Edit
          </button>
          <button onclick="deleteProduct('${item.id}')"
            style="background:red;color:white;padding:10px 16px;border:none;border-radius:10px;cursor:pointer;font-size:14px;">
            🗑️ Delete
          </button>
        </div>
      `;
    });
  } catch (error) {
    console.error("loadProducts error:", error);
    productsDiv.innerHTML = `<p style='padding:20px;color:red;'>Error loading products: ${error.message}</p>`;
  }
}


/* ==============================
   Delete Product
============================== */

window.deleteProduct = async (id) => {
  if (!confirm("Delete this product? This cannot be undone.")) return;
  await deleteDoc(doc(db, "Products", id));
  loadProducts();
  loadStats();
};


/* ==============================
   Edit Product — Open Popup
============================== */

let currentEditId = "";

window.editProduct = async (id) => {
  currentEditId = id;
  const snapshot = await getDocs(collection(db, "Products"));
  let productData = null;
  snapshot.forEach((item) => { if (item.id === id) productData = item.data(); });
  if (!productData) { alert("Product not found."); return; }

  document.getElementById("editName").value        = productData.name        || "";
  document.getElementById("editPrice").value       = productData.price       || "";
  document.getElementById("editOldPrice").value    = productData.oldPrice    || "";
  document.getElementById("editPackQty").value     = productData.packQty     || "";
  document.getElementById("editImage").value       = productData.Image       || "";
  document.getElementById("editDescription").value = productData.description || "";
  document.getElementById("editFewStock").checked      = productData.fewStock     || false;
  document.getElementById("editFreeDelivery").checked  = productData.freeDelivery || false;

  await populateCategorySelect(document.getElementById("editCategory"), productData.category || "");

  document.getElementById("editPopup").style.display = "flex";
};

window.closeEdit = () => {
  document.getElementById("editPopup").style.display = "none";
};

document.getElementById("saveEditBtn").onclick = async () => {
  try {
    await updateDoc(doc(db, "Products", currentEditId), {
      name:         document.getElementById("editName").value.trim(),
      price:        Number(document.getElementById("editPrice").value),
      oldPrice:     Number(document.getElementById("editOldPrice").value) || null,
      packQty:      document.getElementById("editPackQty").value.trim(),
      Image:        document.getElementById("editImage").value.trim(),
      description:  document.getElementById("editDescription").value.trim(),
      category:     document.getElementById("editCategory").value,
      fewStock:     document.getElementById("editFewStock").checked,
      freeDelivery: document.getElementById("editFreeDelivery").checked
    });
    alert("Product Updated Successfully");
    closeEdit();
    loadProducts();
  } catch (error) {
    alert(error.message);
  }
};


/* ==============================
   Stats
============================== */

async function loadStats() {
  const products = await getCountFromServer(collection(db, "Products"));
  const orders   = await getCountFromServer(collection(db, "Orders"));
  document.getElementById("totalProducts").innerText = products.data().count;
  document.getElementById("totalOrders").innerText   = orders.data().count;
}


/* ==============================
   Load All Orders
============================== */

async function loadOrders() {
  ordersDiv.innerHTML = "Loading...";
  try {
    const snapshot = await getDocs(collection(db, "Orders"));
    ordersDiv.innerHTML = "";

    if (snapshot.empty) {
      ordersDiv.innerHTML = "<p style='padding:20px;color:#aaa;'>No orders yet.</p>";
      return;
    }

    const ordersList = [];
    snapshot.forEach((item) => ordersList.push({ id: item.id, ...item.data() }));
    ordersList.sort((a, b) => {
      const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return tb - ta;
    });

    const badgeColors = {
      "Order Placed": { bg: "#fff3cd", color: "#856404" },
      "Accepted":     { bg: "#d4edda", color: "#155724" },
      "Dispatched":   { bg: "#cce5ff", color: "#004085" },
      "Received":     { bg: "#d1f0e0", color: "#0a5c36" }
    };

    ordersList.forEach((data) => {
      const status = data.status || "Order Placed";
      const badge  = badgeColors[status] || badgeColors["Order Placed"];

      let dateStr = "";
      if (data.createdAt) {
        const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        dateStr = d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
      }

      ordersDiv.innerHTML += `
        <div style="background:white;padding:15px;margin-bottom:12px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.07);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div>
              <h3 style="font-size:16px;color:#1a1a1a;margin-bottom:2px;">${data.name || "Product"}</h3>
              ${dateStr ? `<p style="font-size:12px;color:#aaa;">${dateStr}</p>` : ""}
            </div>
            <span style="padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${badge.bg};color:${badge.color};white-space:nowrap;margin-left:8px;">${status}</span>
          </div>
          <p style="color:#555;font-size:14px;margin-bottom:4px;">
            ₹${data.grandTotal || data.price || 0}
            &nbsp;|&nbsp; Qty: ${data.quantity || 1}
            ${data.pack || data.selectedSize ? `&nbsp;|&nbsp; ${data.pack || data.selectedSize}` : ""}
          </p>
          <p style="color:#999;font-size:12px;margin-bottom:4px;">Order ID: ${data.id}</p>
          ${data.userPhone || data.phone ? `<p style="color:#555;font-size:13px;margin-bottom:4px;">📱 ${data.userPhone || data.phone}</p>` : ""}
          ${data.trackingId ? `<p style="color:#1565c0;font-size:13px;margin-bottom:4px;">🚚 Tracking: <b>${data.trackingId}</b></p>` : ""}
          <button onclick="openOrderPopup('${data.id}')"
            style="margin-top:10px;padding:10px 18px;background:#2e7d32;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">
            Manage Order
          </button>
        </div>
      `;
    });
  } catch (error) {
    console.error("loadOrders error:", error);
    ordersDiv.innerHTML = `<p style='padding:20px;color:red;'>Error loading orders: ${error.message}</p>`;
  }
}


/* ==============================
   Order Popup
============================== */

let currentOrderId   = "";
let currentOrderData = {};

window.openOrderPopup = async (id) => {
  currentOrderId = id;
  const snapshot = await getDocs(collection(db, "Orders"));
  let found = false;

  snapshot.forEach((item) => {
    if (item.id === id) { found = true; currentOrderData = item.data(); }
  });

  if (!found) { alert("Order not found"); return; }
  const data = currentOrderData;

  document.getElementById("orderId").innerText     = id;
  document.getElementById("productName").innerText = data.name       || "—";
  document.getElementById("quantity").innerText    = data.quantity   || 1;
  document.getElementById("totalPrice").innerText  = `₹${data.grandTotal || data.price || 0}`;
  document.getElementById("userName").innerText    = data.userName    || data.name    || "—";
  document.getElementById("userEmail").innerText   = data.userEmail   || data.email   || "—";
  document.getElementById("userPhone").innerText   = data.userPhone   || data.phone   || "—";
  document.getElementById("userAddress").innerText = data.userAddress || data.address || "—";

  const select = document.getElementById("statusSelect");
  select.innerHTML = STATUS_OPTIONS.map(s =>
    `<option value="${s}" ${s === (data.status || "Order Placed") ? "selected" : ""}>${s}</option>`
  ).join("");

  const trackingInput = document.getElementById("trackingId");
  trackingInput.value = data.trackingId || "";
  toggleTrackingField(data.status || "Order Placed");
  select.onchange = () => toggleTrackingField(select.value);

  document.getElementById("statusPopup").style.display = "flex";
};

function toggleTrackingField(status) {
  const trackingInput = document.getElementById("trackingId");
  if (status === "Dispatched" || status === "Received") {
    trackingInput.style.display = "block";
    trackingInput.placeholder   = "Enter Tracking ID (required)";
  } else {
    trackingInput.style.display = "none";
    trackingInput.value         = "";
  }
}

window.closePopup = () => {
  document.getElementById("statusPopup").style.display = "none";
};


/* ==============================
   Update Order Status
============================== */

document.getElementById("updateBtn").onclick = async () => {
  const newStatus   = document.getElementById("statusSelect").value;
  const newTracking = document.getElementById("trackingId").value.trim();

  if ((newStatus === "Dispatched" || ne