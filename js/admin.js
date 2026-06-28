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


/* ── Status options ── */
const STATUS_OPTIONS = ["Order Placed", "Accepted", "Dispatched", "Received"];

/* ── Default categories ── */
const DEFAULT_CATEGORIES = ["Chocolate", "Honey", "Herbs", "Oils", "Fruits", "Organic Products"];


/* ==============================
   Auth Gate — everything runs after login confirmed
============================== */

onAuthStateChanged(auth, (user) => {

  if (!user) { window.location = "index.html"; return; }

  if (user.email !== "kodaihillsspot@gmail.com") {
    alert("Access denied");
    window.location = "home.html";
    return;
  }

  /* ── DOM refs ── */
  const productsDiv    = document.getElementById("products");
  const ordersDiv      = document.getElementById("allOrders");
  const enableVariants = document.getElementById("enableVariants");
  const variantSection = document.getElementById("variantSection");
  const variantFields  = document.getElementById("variantFields");


  /* ==============================
     Users button
  ============================== */

  document.getElementById("userBtn").onclick = () => {
    window.location = "srkxditit.html";
  };


  /* ==============================
     Variant toggle
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

  document.getElementById("addVariantBtn").onclick = () => {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <div style="display:flex;gap:10px;margin-bottom:10px;">
        <input class="variantQty"   placeholder="500g / 1kg" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;">
        <input class="variantPrice" placeholder="Price" type="number" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;">
        <button class="removeVariant"
          style="width:44px;height:44px;background:red;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;">✖</button>
      </div>
    `;
    variantFields.appendChild(div);
    div.querySelector(".removeVariant").onclick = () => div.remove();
  };


  /* ==============================
     Categories
  ============================== */

  const CAT_DOC = doc(db, "Categories", "list");

  async function getCategories() {
    try {
      const snap = await getDoc(CAT_DOC);
      if (snap.exists() && snap.data().items?.length) return snap.data().items;
      return [...DEFAULT_CATEGORIES];
    } catch (e) {
      return [...DEFAULT_CATEGORIES];
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
    const cats  = await getCategories();
    const chips = document.getElementById("categoryChips");
    if (!chips) return;
    chips.innerHTML = "";
    cats.forEach(cat => {
      const isBuiltin = DEFAULT_CATEGORIES.map(d => d.toLowerCase()).includes(cat.toLowerCase());
      const chip = document.createElement("span");
      chip.className = `category-chip${isBuiltin ? " builtin" : ""}`;
      chip.innerHTML = `${cat}${isBuiltin ? "" : `<button class="chip-delete" onclick="window._deleteCategory('${cat}')">✕</button>`}`;
      chips.appendChild(chip);
    });
    await populateCategorySelect(document.getElementById("category"));
    await populateCategorySelect(document.getElementById("editCategory"));
  }

  window._deleteCategory = async (name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const cats = await getCategories();
    await saveCategories(cats.filter(c => c !== name));
    loadCategoryChips();
  };

  document.getElementById("addCategoryBtn").onclick = async () => {
    const input = document.getElementById("newCategoryInput");
    const name  = input.value.trim();
    if (!name) { alert("Enter a category name."); return; }
    const cats = await getCategories();
    if (cats.some(c => c.toLowerCase() === name.toLowerCase())) {
      alert("Category already exists.");
      return;
    }
    cats.push(name);
    await saveCategories(cats);
    input.value = "";
    loadCategoryChips();
  };

  document.getElementById("newCategoryInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("addCategoryBtn").click();
  });


  /* ==============================
     Stats
  ============================== */

  async function loadStats() {
    try {
      const p = await getCountFromServer(collection(db, "Products"));
      const o = await getCountFromServer(collection(db, "Orders"));
      document.getElementById("totalProducts").innerText = p.data().count;
      document.getElementById("totalOrders").innerText   = o.data().count;
    } catch(e) { console.error("Stats error:", e); }
  }


  /* ==============================
     Load Products
  ============================== */

  async function loadProducts() {
    productsDiv.innerHTML = "<p style='padding:20px;color:#888;'>Loading...</p>";
    try {
      const snapshot = await getDocs(collection(db, "Products"));

      if (snapshot.empty) {
        productsDiv.innerHTML = "<p style='padding:20px;color:#aaa;'>No products yet.</p>";
        return;
      }

      productsDiv.innerHTML = "";

      snapshot.forEach((item) => {
        const d = item.data();

        let qtyHtml = "";
        if (d.quantityVariants && d.quantityVariants.length > 0) {
          qtyHtml = d.quantityVariants.map(q =>
            `<span style="display:inline-block;padding:4px 10px;background:#f5f5f5;margin:3px;border-radius:8px;font-size:12px;">${q.qty} — ₹${q.price}</span>`
          ).join("");
        } else {
          qtyHtml = `<span style="font-size:13px;color:#555;">${d.packQty || "—"}</span>`;
        }

        const delivBadge = d.freeDelivery
          ? `<span style="display:inline-block;padding:3px 10px;background:#e8f5e9;color:#2e7d32;border-radius:20px;font-size:12px;font-weight:600;">🚚 Free Delivery</span>`
          : `<span style="display:inline-block;padding:3px 10px;background:#fce4ec;color:#c62828;border-radius:20px;font-size:12px;font-weight:600;">🚚 ₹50 Delivery</span>`;

        const stockBadge = d.fewStock
          ? `<span style="display:inline-block;padding:3px 10px;background:#fff3e0;color:#e65100;border-radius:20px;font-size:12px;font-weight:600;margin-left:6px;">⚠️ Few Stock</span>`
          : "";

        productsDiv.innerHTML += `
          <div style="background:white;padding:15px;margin-bottom:15px;border-radius:15px;box-shadow:0 2px 8px rgba(0,0,0,.07);">
            <img src="${d.Image}" style="width:100%;height:150px;object-fit:cover;border-radius:10px;" onerror="this.src='logo.png'">
            <h3 style="margin:10px 0 4px;">${d.name}</h3>
            <p style="color:#2e7d32;font-weight:700;margin-bottom:4px;">
              ₹${d.price}
              ${d.oldPrice ? `<span style="color:#aaa;font-weight:400;text-decoration:line-through;font-size:13px;margin-left:6px;">₹${d.oldPrice}</span>` : ""}
            </p>
            <p style="margin-bottom:6px;">${qtyHtml}</p>
            <p style="font-size:12px;color:#888;margin-bottom:6px;">📂 ${d.category || "—"}</p>
            ${delivBadge}${stockBadge}
            <br>
            <button onclick="window._editProduct('${item.id}')"
              style="background:#2196f3;color:white;padding:10px 16px;border:none;border-radius:10px;margin-right:10px;margin-top:12px;cursor:pointer;font-size:14px;">
              ✏️ Edit
            </button>
            <button onclick="window._deleteProduct('${item.id}')"
              style="background:red;color:white;padding:10px 16px;border:none;border-radius:10px;cursor:pointer;font-size:14px;">
              🗑️ Delete
            </button>
          </div>
        `;
      });
    } catch (e) {
      console.error("loadProducts error:", e);
      productsDiv.innerHTML = `<p style='padding:20px;color:red;'>Failed to load products.<br>${e.message}</p>`;
    }
  }


  /* ==============================
     Delete Product
  ============================== */

  window._deleteProduct = async (id) => {
    if (!confirm("Delete this product? Cannot be undone.")) return;
    await deleteDoc(doc(db, "Products", id));
    loadProducts();
    loadStats();
  };


  /* ==============================
     Edit Product
  ============================== */

  let currentEditId = "";

  window._editProduct = async (id) => {
    currentEditId = id;
    const snap = await getDocs(collection(db, "Products"));
    let data = null;
    snap.forEach(item => { if (item.id === id) data = item.data(); });
    if (!data) { alert("Product not found."); return; }

    document.getElementById("editName").value        = data.name        || "";
    document.getElementById("editPrice").value       = data.price       || "";
    document.getElementById("editOldPrice").value    = data.oldPrice    || "";
    document.getElementById("editPackQty").value     = data.packQty     || "";
    document.getElementById("editImage").value       = data.Image       || "";
    document.getElementById("editDescription").value = data.description || "";
    document.getElementById("editFewStock").checked      = data.fewStock     || false;
    document.getElementById("editFreeDelivery").checked  = data.freeDelivery || false;

    await populateCategorySelect(document.getElementById("editCategory"), data.category || "");

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
      alert("Product Updated!");
      window.closeEdit();
      loadProducts();
    } catch (e) { alert(e.message); }
  };


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
        alert("Please fill all required fields.");
        return;
      }

      const qtyInputs   = document.querySelectorAll(".variantQty");
      const priceInputs = document.querySelectorAll(".variantPrice");
      const quantityVariants = [];
      for (let i = 0; i < qtyInputs.length; i++) {
        const qty = qtyInputs[i].value.trim();
        const vp  = priceInputs[i].value.trim();
        if (qty && vp) quantityVariants.push({ qty, price: Number(vp) });
      }

      await addDoc(collection(db, "Products"), {
        name, price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        packQty:  enableVariants.checked ? "" : packQty,
        quantityVariants, category,
        Image: image, description, fewStock, freeDelivery
      });

      alert("Product Added!");

      ["name","price","oldPrice","packQty","image","description"].forEach(id => {
        document.getElementById(id).value = "";
      });
      document.getElementById("fewStock").checked     = false;
      document.getElementById("freeDelivery").checked = false;
      enableVariants.checked       = false;
      variantFields.innerHTML      = "";
      variantSection.style.display = "none";
      document.getElementById("packQty").style.display = "block";

      loadProducts();
      loadStats();

    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };


  /* ==============================
     Load Orders
  ============================== */

  async function loadOrders() {
    ordersDiv.innerHTML = "<p style='padding:20px;color:#888;'>Loading...</p>";
    try {
      const snapshot = await getDocs(collection(db, "Orders"));

      if (snapshot.empty) {
        ordersDiv.innerHTML = "<p style='padding:20px;color:#aaa;'>No orders yet.</p>";
        return;
      }

      const list = [];
      snapshot.forEach(item => list.push({ id: item.id, ...item.data() }));
      list.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return tb - ta;
      });

      const badgeColors = {
        "Order Placed": { bg:"#fff3cd", color:"#856404" },
        "Accepted":     { bg:"#d4edda", color:"#155724" },
        "Dispatched":   { bg:"#cce5ff", color:"#004085" },
        "Received":     { bg:"#d1f0e0", color:"#0a5c36" }
      };

      ordersDiv.innerHTML = "";

      list.forEach(data => {
        const status = data.status || "Order Placed";
        const badge  = badgeColors[status] || badgeColors["Order Placed"];
        let dateStr  = "";
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
              <span style="padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${badge.bg};color:${badge.color};white-space:nowrap;margin-left:8px;">
                ${status}
              </span>
            </div>
            <p style="color:#555;font-size:14px;margin-bottom:4px;">
              ₹${data.grandTotal || data.price || 0} &nbsp;|&nbsp; Qty: ${data.quantity || 1}
              ${data.pack || data.selectedSize ? `&nbsp;|&nbsp; ${data.pack || data.selectedSize}` : ""}
            </p>
            <p style="color:#999;font-size:12px;margin-bottom:4px;">Order ID: ${data.id}</p>
            ${data.userPhone || data.phone ? `<p style="color:#555;font-size:13px;margin-bottom:4px;">📱 ${data.userPhone || data.phone}</p>` : ""}
            ${data.trackingId ? `<p style="color:#1565c0;font-size:13px;margin-bottom:4px;">🚚 Tracking: <b>${data.trackingId}</b></p>` : ""}
            <button onclick="window._openOrderPopup('${data.id}')"
              style="margin-top:10px;padding:10px 18px;background:#2e7d32;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">
              Manage Order
            </button>
          </div>
        `;
      });
    } catch (e) {
      console.error("loadOrders error:", e);
      ordersDiv.innerHTML = `<p style='padding:20px;color:red;'>Failed to load orders.<br>${e.message}</p>`;
    }
  }


  /* ==============================
     Order Popup
  ============================== */

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

    const trackingInput = document.getElementById("trackingId");
    trackingInput.value = data.trackingId || "";
    toggleTracking(data.status || "Order Placed");
    select.onchange = () => toggleTracking(select.value);

    document.getElementById("statusPopup").style.display = "flex";
  };

  function toggleTracking(status) {
    const el = document.getElementById("trackingId");
    if (status === "Dispatched" || status === "Received") {
      el.style.display = "block";
      el.placeholder   = "Enter Tracking ID (required)";
    } else {
      el.style.display = "none";
      el.value         = "";
    }
  }

  window.closePopup = () => {
    document.getElementById("statusPopup").style.display = "none";
  };

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
      alert(`✅ Order updated to "${newStatus}"!`);
      window.closePopup();
      loadOrders();
    } catch (e) {
      alert("Update failed: " + e.message);
    }
  };


  /* ==============================
     Initial Load
  ============================== */

  loadStats();
  loadProducts();
  loadOrders();
  loadCategoryChips();

}); /* end onAuthStateChanged */