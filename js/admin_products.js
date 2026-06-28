import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const DEFAULT_CATEGORIES = ["Chocolate","Honey","Herbs","Oils","Fruits","Organic Products"];
const CAT_DOC_PATH       = () => doc(db, "Categories", "list");

onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.replace("index.html"); return; }
  if (user.email !== "kodaihillsspot@gmail.com") {
    window.location.replace("home.html"); return;
  }
  // Auth passed — reveal page
  document.getElementById("authLoader").style.display = "none";
  document.body.style.display = "block";
  init();
});

function init() {

  /* ── Category helpers ── */
  async function getCategories() {
    try {
      const snap = await getDoc(CAT_DOC_PATH());
      if (snap.exists() && snap.data().items?.length) return snap.data().items;
    } catch(_) {}
    return [...DEFAULT_CATEGORIES];
  }

  async function saveCategories(items) {
    await setDoc(CAT_DOC_PATH(), { items });
  }

  async function populateCategorySelect(el, selected) {
    if (!el) return;
    const cats = await getCategories();
    el.innerHTML = cats.map(c =>
      `<option value="${c}" ${c === selected ? "selected" : ""}>${c}</option>`
    ).join("");
  }

  async function loadCategoryChips() {
    const cats  = await getCategories();
    const chips = document.getElementById("categoryChips");
    chips.innerHTML = "";
    cats.forEach(cat => {
      const isBuiltin = DEFAULT_CATEGORIES.map(d => d.toLowerCase()).includes(cat.toLowerCase());
      const chip = document.createElement("span");
      chip.className = `chip${isBuiltin ? " builtin" : ""}`;
      chip.innerHTML = `${cat}${isBuiltin ? "" : `<button class="chip-del" onclick="window._deleteCategory('${cat}')">✕</button>`}`;
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
    if (cats.some(c => c.toLowerCase() === name.toLowerCase())) { alert("Already exists."); return; }
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
    div.className = "variant-row";
    div.innerHTML = `
      <input class="variantQty" placeholder="500g / 1kg">
      <input class="variantPrice" placeholder="Price" type="number">
      <button onclick="this.parentElement.remove()">✖</button>
    `;
    variantFields.appendChild(div);
  };

  /* ── Load Products ── */
  async function loadProducts() {
    const div = document.getElementById("products");
    div.innerHTML = "<p style='color:#aaa;padding:10px;'>Loading…</p>";
    try {
      const snapshot = await getDocs(collection(db, "Products"));
      if (snapshot.empty) { div.innerHTML = "<p style='color:#aaa;padding:10px;'>No products yet.</p>"; return; }
      div.innerHTML = "";
      snapshot.forEach(item => {
        const d = item.data();
        let qtyHtml = "";
        if (d.quantityVariants?.length) {
          qtyHtml = d.quantityVariants.map(q =>
            `<span style="display:inline-block;padding:3px 9px;background:#f5f5f5;margin:2px;border-radius:8px;font-size:12px;">${q.qty} — ₹${q.price}</span>`
          ).join("");
        } else {
          qtyHtml = `<span style="font-size:13px;color:#555;">${d.packQty || "—"}</span>`;
        }
        const delivBadge = d.freeDelivery
          ? `<span style="padding:3px 10px;background:#e8f5e9;color:#2e7d32;border-radius:20px;font-size:11px;font-weight:700;">🚚 Free Delivery</span>`
          : `<span style="padding:3px 10px;background:#fce4ec;color:#c62828;border-radius:20px;font-size:11px;font-weight:700;">🚚 ₹50 Delivery</span>`;
        const stockBadge = d.fewStock
          ? `<span style="padding:3px 10px;background:#fff3e0;color:#e65100;border-radius:20px;font-size:11px;font-weight:700;margin-left:5px;">⚠️ Few Stock</span>`
          : "";
        div.innerHTML += `
          <div class="product-card">
            <img src="${d.Image}" onerror="this.src='logo.png'">
            <h3>${d.name}</h3>
            <p style="color:#2e7d32;font-weight:700;font-size:14px;margin:4px 0;">
              ₹${d.price}
              ${d.oldPrice ? `<span style="color:#bbb;font-weight:400;text-decoration:line-through;font-size:12px;margin-left:5px;">₹${d.oldPrice}</span>` : ""}
            </p>
            <p style="margin:4px 0;">${qtyHtml}</p>
            <p style="font-size:12px;color:#aaa;margin:4px 0;">📂 ${d.category || "—"}</p>
            ${delivBadge}${stockBadge}
            <div class="card-actions">
              <button class="edit-btn" onclick="window._editProduct('${item.id}')">✏️ Edit</button>
              <button class="del-btn" onclick="window._deleteProduct('${item.id}')">🗑️ Delete</button>
            </div>
          </div>`;
      });
    } catch(e) {
      div.innerHTML = `<p style='color:red;padding:10px;'>Failed: ${e.message}</p>`;
    }
  }

  /* ── Delete product ── */
  window._deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "Products", id));
    loadProducts();
  };

  /* ── Edit product ── */
  let currentEditId = "";
  window._editProduct = async (id) => {
    currentEditId = id;
    const snap = await getDocs(collection(db, "Products"));
    let data = null;
    snap.forEach(item => { if (item.id === id) data = item.data(); });
    if (!data) { alert("Not found."); return; }

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
    } catch(e) { alert(e.message); }
  };

  /* ── Add product ── */
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
      alert("Please fill all required fields (*)."); return;
    }

    const qtyInputs   = document.querySelectorAll(".variantQty");
    const priceInputs = document.querySelectorAll(".variantPrice");
    const quantityVariants = [];
    for (let i = 0; i < qtyInputs.length; i++) {
      const qty = qtyInputs[i].value.trim();
      const vp  = priceInputs[i].value.trim();
      if (qty && vp) quantityVariants.push({ qty, price: Number(vp) });
    }

    try {
      await addDoc(collection(db, "Products"), {
        name, price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        packQty: enableVariants.checked ? "" : packQty,
        quantityVariants, category,
        Image: image, description, fewStock, freeDelivery
      });
      alert("Product Added!");
      ["name","price","oldPrice","packQty","image","description"].forEach(id => {
        document.getElementById(id).value = "";
      });
      document.getElementById("fewStock").checked = false;
      document.getElementById("freeDelivery").checked = false;
      enableVariants.checked = false;
      variantFields.innerHTML = "";
      variantSection.style.display = "none";
      document.getElementById("packQty").style.display = "block";
      loadProducts();
    } catch(e) { alert(e.message); }
  };

  /* ── Init ── */
  loadCategoryChips();
  loadProducts();
}
