import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ── HTML escape — prevents XSS when rendering Firestore data ── */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const DEFAULT_CATEGORIES = ["Chocolate", "Honey", "Herbs", "Oils", "Fruits", "Organic Products"];
const CAT_DOC_PATH       = () => doc(db, "Categories", "list");

/* ── Auth guard ── */
onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.replace("index.html"); return; }
  if (user.email !== "kodaihillsspot@gmail.com") {
    window.location.replace("home.html"); return;
  }
  document.getElementById("authLoader").style.display = "none";
  document.body.style.display = "block";
  init();
});

/* ════════════════════════════════════════════════════════ */
function init() {

  /* ── Category helpers ── */
  async function getCategories() {
    try {
      const snap = await getDoc(CAT_DOC_PATH());
      if (snap.exists() && snap.data().items?.length) return snap.data().items;
    } catch (e) {
      console.warn("getCategories failed:", e);
    }
    return [...DEFAULT_CATEGORIES];
  }

  async function saveCategories(items) {
    await setDoc(CAT_DOC_PATH(), { items });
  }

  async function populateCategorySelect(el, selected = "") {
    if (!el) return;
    const cats = await getCategories();
    /* FIX: escape category names before inserting into option innerHTML */
    el.innerHTML = cats.map(c =>
      `<option value="${esc(c)}" ${c === selected ? "selected" : ""}>${esc(c)}</option>`
    ).join("");
  }

  async function loadCategoryChips() {
    const cats  = await getCategories();
    const chips = document.getElementById("categoryChips");
    chips.innerHTML = "";
    cats.forEach(cat => {
      const isBuiltin = DEFAULT_CATEGORIES.map(d => d.toLowerCase()).includes(cat.toLowerCase());
      const chip      = document.createElement("span");
      chip.className  = `chip${isBuiltin ? " builtin" : ""}`;
      /* FIX: use esc() for category name; data-cat keeps the raw value for logic */
      if (isBuiltin) {
        chip.textContent = cat;
      } else {
        chip.innerHTML =
          `${esc(cat)}<button class="chip-del" data-cat="${esc(cat)}">✕</button>`;
      }
      chips.appendChild(chip);
    });
    await populateCategorySelect(document.getElementById("category"));
    await populateCategorySelect(document.getElementById("editCategory"));
  }

  document.getElementById("categoryChips").addEventListener("click", async (e) => {
    const btn = e.target.closest(".chip-del");
    if (!btn) return;
    const name = btn.dataset.cat;
    if (!confirm(`Delete category "${name}"?`)) return;
    const cats = await getCategories();
    await saveCategories(cats.filter(c => c !== name));
    loadCategoryChips();
  });

  document.getElementById("addCategoryBtn").onclick = async () => {
    const input = document.getElementById("newCategoryInput");
    const name  = input.value.trim();
    if (!name) { alert("Enter a category name."); return; }
    const cats = await getCategories();
    if (cats.some(c => c.toLowerCase() === name.toLowerCase())) {
      alert("Category already exists."); return;
    }
    cats.push(name);
    await saveCategories(cats);
    input.value = "";
    loadCategoryChips();
  };

  document.getElementById("newCategoryInput").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("addCategoryBtn").click();
  });

  /* ── Variant toggle ── */
  const enableVariants = document.getElementById("enableVariants");
  const variantSection = document.getElementById("variantSection");
  const variantFields  = document.getElementById("variantFields");
  const packQtyInput   = document.getElementById("packQty");

  enableVariants.onchange = () => {
    if (enableVariants.checked) {
      variantSection.style.display = "block";
      packQtyInput.style.display   = "none";
    } else {
      variantSection.style.display = "none";
      packQtyInput.style.display   = "block";
      variantFields.innerHTML      = "";
    }
  };

  document.getElementById("addVariantBtn").onclick = () => {
    const div = document.createElement("div");
    div.className = "variant-row";
    /* Safe: no Firestore data here, just a static template */
    div.innerHTML = `
      <input class="variantQty"   placeholder="500g / 1kg">
      <input class="variantPrice" placeholder="Price" type="number">
      <button type="button" onclick="this.parentElement.remove()">✖</button>`;
    variantFields.appendChild(div);
  };

  /* ── Load Products ── */
  async function loadProducts() {
    const div = document.getElementById("products");
    div.innerHTML = "<p style='color:#aaa;padding:10px;'>Loading…</p>";
    try {
      const snapshot = await getDocs(collection(db, "Products"));
      if (snapshot.empty) {
        div.innerHTML = "<p style='color:#aaa;padding:10px;'>No products yet.</p>";
        return;
      }
      div.innerHTML = "";
      snapshot.forEach(item => {
        const d   = item.data();
        const pid = item.id;

        let qtyHtml = "";
        if (d.quantityVariants?.length) {
          qtyHtml = d.quantityVariants.map(q =>
            `<span style="display:inline-block;padding:3px 9px;background:#f5f5f5;margin:2px;border-radius:8px;font-size:12px;">
               ${esc(q.qty)} — ₹${Number(q.price)}
             </span>`
          ).join("");
        } else {
          qtyHtml = `<span style="font-size:13px;color:#555;">${esc(d.packQty || "—")}</span>`;
        }

        const delivBadge = d.freeDelivery
          ? `<span style="padding:3px 10px;background:#e8f5e9;color:#2e7d32;border-radius:20px;font-size:11px;font-weight:700;">🚚 Free Delivery</span>`
          : `<span style="padding:3px 10px;background:#fce4ec;color:#c62828;border-radius:20px;font-size:11px;font-weight:700;">🚚 ₹50 Delivery</span>`;

        const stockBadge = d.fewStock
          ? `<span style="padding:3px 10px;background:#fff3e0;color:#e65100;border-radius:20px;font-size:11px;font-weight:700;margin-left:5px;">⚠️ Few Stock</span>`
          : "";

        /* FIX: escape all Firestore strings with esc() before inserting into innerHTML */
        div.innerHTML += `
          <div class="product-card" data-id="${esc(pid)}">
            <img src="${esc(d.Image || "")}" onerror="this.src='logo.png'" alt="${esc(d.name || "")}">
            <h3>${esc(d.name || "Unnamed")}</h3>
            <p style="color:#2e7d32;font-weight:700;font-size:14px;margin:4px 0;">
              ₹${Number(d.price)}
              ${d.oldPrice
                ? `<span style="color:#bbb;font-weight:400;text-decoration:line-through;font-size:12px;margin-left:5px;">₹${Number(d.oldPrice)}</span>`
                : ""}
            </p>
            <p style="margin:4px 0;">${qtyHtml}</p>
            <p style="font-size:12px;color:#aaa;margin:4px 0;">📂 ${esc(d.category || "—")}</p>
            ${delivBadge}${stockBadge}
            <div class="card-actions">
              <button class="edit-btn" data-action="edit"   data-id="${esc(pid)}">✏️ Edit</button>
              <button class="del-btn"  data-action="delete" data-id="${esc(pid)}">🗑️ Delete</button>
            </div>
          </div>`;
      });
    } catch (e) {
      console.error("loadProducts error:", e);
      div.innerHTML = `<p style='color:red;padding:10px;'>Failed to load: ${esc(e.message)}</p>`;
    }
  }

  /* FIX: event delegation — no inline onclick, safe with any product ID */
  document.getElementById("products").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id     = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "delete") await handleDelete(id);
    if (action === "edit")   await handleEdit(id);
  });

  /* ── Delete ── */
  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "Products", id));
      loadProducts();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  }

  /* ── Edit ── */
  let currentEditId = "";

  async function handleEdit(id) {
    currentEditId = id;
    try {
      const snap = await getDoc(doc(db, "Products", id));
      if (!snap.exists()) { alert("Product not found."); return; }
      const data = snap.data();

      document.getElementById("editName").value        = data.name        || "";
      document.getElementById("editPrice").value       = data.price       || "";
      document.getElementById("editOldPrice").value    = data.oldPrice    || "";
      document.getElementById("editPackQty").value     = data.packQty     || "";
      document.getElementById("editImage").value       = data.Image       || "";
      document.getElementById("editDescription").value = data.description || "";
      document.getElementById("editFewStock").checked     = !!data.fewStock;
      document.getElementById("editFreeDelivery").checked = !!data.freeDelivery;

      await populateCategorySelect(document.getElementById("editCategory"), data.category || "");
      document.getElementById("editPopup").style.display = "flex";
    } catch (e) {
      alert("Failed to load product: " + e.message);
    }
  }

  window.closeEdit = () => {
    document.getElementById("editPopup").style.display = "none";
    currentEditId = "";
  };

  document.getElementById("editPopup").addEventListener("click", (e) => {
    if (e.target === document.getElementById("editPopup")) window.closeEdit();
  });

  document.getElementById("saveEditBtn").onclick = async () => {
    if (!currentEditId) { alert("No product selected."); return; }
    const name  = document.getElementById("editName").value.trim();
    const price = document.getElementById("editPrice").value.trim();
    if (!name || !price) { alert("Name and price are required."); return; }
    try {
      await updateDoc(doc(db, "Products", currentEditId), {
        name,
        price:        Number(price),
        oldPrice:     Number(document.getElementById("editOldPrice").value) || null,
        packQty:      document.getElementById("editPackQty").value.trim(),
        Image:        document.getElementById("editImage").value.trim(),
        description:  document.getElementById("editDescription").value.trim(),
        category:     document.getElementById("editCategory").value,
        fewStock:     document.getElementById("editFewStock").checked,
        freeDelivery: document.getElementById("editFreeDelivery").checked
      });
      alert("✅ Product updated!");
      window.closeEdit();
      loadProducts();
    } catch (e) {
      alert("Save failed: " + e.message);
    }
  };

  /* ── Add Product ── */
  document.getElementById("addBtn").onclick = async () => {
    const name        = document.getElementById("name").value.trim();
    const price       = document.getElementById("price").value.trim();
    const oldPrice    = document.getElementById("oldPrice").value.trim();
    const packQty     = document.getElementById("packQty").value.trim();
    const category    = document.getElementById("category").value;
    const image       = document.getElementById("image").value.trim();
    const description = document.getElementById("description").value.trim();
    const fewStock    = document.getElementById("fewStock").checked;
    const freeDelivery= document.getElementById("freeDelivery").checked;

    if (!name || !price || !image || !description) {
      alert("Please fill all required fields: Name, Price, Image URL, Description.");
      return;
    }

    const quantityVariants = [];
    if (enableVariants.checked) {
      const qtyInputs   = document.querySelectorAll(".variantQty");
      const priceInputs = document.querySelectorAll(".variantPrice");
      for (let i = 0; i < qtyInputs.length; i++) {
        const qty = qtyInputs[i].value.trim();
        const vp  = priceInputs[i].value.trim();
        if (qty && vp) quantityVariants.push({ qty, price: Number(vp) });
      }
      if (!quantityVariants.length) {
        alert("Please add at least one quantity option, or disable the variants toggle.");
        return;
      }
    }

    try {
      await addDoc(collection(db, "Products"), {
        name,
        price:           Number(price),
        oldPrice:        oldPrice ? Number(oldPrice) : null,
        packQty:         enableVariants.checked ? "" : packQty,
        quantityVariants,
        category,
        Image:           image,
        description,
        fewStock,
        freeDelivery,
        createdAt:       new Date()
      });
      alert("✅ Product Added!");

      ["name", "price", "oldPrice", "packQty", "image", "description"].forEach(id => {
        document.getElementById(id).value = "";
      });
      document.getElementById("fewStock").checked     = false;
      document.getElementById("freeDelivery").checked = false;
      enableVariants.checked       = false;
      variantFields.innerHTML      = "";
      variantSection.style.display = "none";
      packQtyInput.style.display   = "block";
      loadProducts();
    } catch (e) {
      alert("Add failed: " + e.message);
      console.error("addDoc error:", e);
    }
  };

  /* ── Init ── */
  loadCategoryChips();
  loadProducts();

} // end init()
