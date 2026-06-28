import { db, auth } from "./firebase.js";
import {
    collection, getDocs, addDoc,
    query, where, updateDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const productsDiv   = document.getElementById("products");
const profileNav    = document.getElementById("profileNav");
const searchInput   = document.querySelector(".search input");
const categoryScroll= document.querySelector(".category-scroll");

let allProducts = [];
let currentUser = null;
let activeCategory = "All";

const inCartIds = new Set();

/* ─── Category emoji map ─── */
const CAT_EMOJI = {
  "chocolate":        "🍫",
  "honey":            "🍯",
  "herbs":            "🌿",
  "oils":             "🫙",
  "fruits":           "🍎",
  "organic products": "🌱",
  "vegetables":       "🥕",
  "organic":          "🌿",
};
function emojiFor(cat) {
  return CAT_EMOJI[cat.toLowerCase()] || "🏷️";
}

/* ─── Dynamic Styles ─── */
const style = document.createElement("style");
style.innerHTML = `
.category-card {
  min-width: 90px;
  background: white;
  padding: 10px 12px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,.1);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  border: 2px solid transparent;
  transition: all .2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.category-card.active {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}
.card {
  position: relative;
  cursor: pointer;
  background: white;
  padding: 10px;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0,0,0,.08);
  animation: slideUp .7s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform .3s;
}
.card:hover { transform: translateY(-4px); }
.card img {
  width: 100%;
  height: 135px;
  object-fit: cover;
  border-radius: 11px;
  transition: .3s;
}
.card:hover img { transform: scale(1.04); }
.card h3 { margin-top: 10px; font-size: 16px; }
.stock-badge {
  position: absolute;
  top: 8px; right: 8px;
  background: red;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
}
.pack { margin-top: 5px; font-size: 13px; font-weight: bold; color: #666; }
.price-box { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
.old-price { color: #ff3b30; font-size: 15px; opacity: .7; text-decoration: line-through; }
.new-price { color: #2e7d32; font-size: 22px; font-weight: bold; }
.btn {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: #2e7d32; color: white; cursor: pointer;
  font-size: 14px; font-weight: 600; margin-top: auto;
}
.btn:active { transform: scale(.95); }
.buy-btn {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg,#ff6f00,#ffa000);
  border: none; border-radius: 10px; color: #fff;
  font-size: 14px; font-weight: 700; cursor: pointer;
  margin-top: auto; display: flex; align-items: center;
  justify-content: center; gap: 6px;
  box-shadow: 0 4px 12px rgba(255,111,0,.35);
}
.buy-btn:active { transform: scale(.95); box-shadow: none; }
.no-products {
  grid-column: 1/-1;
  text-align: center;
  padding: 40px 20px;
  color: #aaa;
  font-size: 14px;
}
.no-products div { font-size: 36px; margin-bottom: 8px; }
.home-toast {
  position: fixed; bottom: 90px; left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #2e7d32; color: white;
  padding: 11px 22px; border-radius: 30px;
  font-size: 14px; font-weight: 600;
  opacity: 0; transition: .3s; z-index: 9999;
  white-space: nowrap; pointer-events: none;
}
.home-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
`;
document.head.appendChild(style);

/* ─── Toast ─── */
const toastEl = document.createElement("div");
toastEl.className = "home-toast";
document.body.appendChild(toastEl);

function showToast(msg, isError = false) {
  toastEl.textContent = isError ? `✗ ${msg}` : `✓ ${msg}`;
  toastEl.style.background = isError ? "#c62828" : "#2e7d32";
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2400);
}

/* ─── Load Categories from Firestore ─── */
async function loadCategories() {
  const DEFAULT = ["Chocolate","Honey","Herbs","Oils","Fruits","Organic Products"];
  let cats = DEFAULT;

  try {
    const snap = await getDoc(doc(db, "Categories", "list"));
    if (snap.exists() && snap.data().items?.length) {
      cats = snap.data().items;
    }
  } catch(e) {
    console.warn("Could not load categories:", e);
  }

  // Clear old hardcoded chips
  categoryScroll.innerHTML = "";

  // "All" chip
  const allChip = document.createElement("div");
  allChip.className = "category-card active";
  allChip.textContent = "🏠 All";
  allChip.dataset.cat = "All";
  categoryScroll.appendChild(allChip);

  // One chip per category
  cats.forEach(cat => {
    const chip = document.createElement("div");
    chip.className = "category-card";
    chip.textContent = `${emojiFor(cat)} ${cat}`;
    chip.dataset.cat = cat;
    categoryScroll.appendChild(chip);
  });

  // Click handler
  categoryScroll.addEventListener("click", (e) => {
    const chip = e.target.closest(".category-card");
    if (!chip) return;
    document.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeCategory = chip.dataset.cat;
    filterAndRender();
  });
}

/* ─── Auth ─── */
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (profileNav) {
    profileNav.href      = user ? "profile.html" : "login.html";
    profileNav.innerHTML = user ? "👤<br>Yours" : "🔐<br>Login";
  }

  if (user) {
    try {
      const q = query(collection(db, "Cart"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      snapshot.forEach(d => inCartIds.add(d.data().productId));
    } catch(e) { console.error("Pre-load cart error:", e); }
  } else {
    const local = JSON.parse(localStorage.getItem("guestCart")) || [];
    local.forEach(item => inCartIds.add(item.productId));
  }

  await loadCategories();
  await loadProducts();
});

/* ─── Load Products ─── */
async function loadProducts() {
  try {
    productsDiv.innerHTML = `<div class="no-products"><div>⏳</div>Loading…</div>`;
    const snapshot = await getDocs(collection(db, "Products"));
    if (snapshot.empty) {
      productsDiv.innerHTML = `<div class="no-products"><div>📦</div>No Products Available</div>`;
      return;
    }
    allProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    filterAndRender();
  } catch(error) {
    console.error(error);
    productsDiv.innerHTML = `<div class="no-products"><div>❌</div>Error Loading Products</div>`;
  }
}

/* ─── Filter + Render ─── */
function filterAndRender() {
  let list = allProducts;
  if (activeCategory !== "All") {
    list = list.filter(p =>
      (p.category || "").toLowerCase() === activeCategory.toLowerCase()
    );
  }
  renderProducts(list);
}

/* ─── Render Products ─── */
function renderProducts(products) {
  productsDiv.innerHTML = "";

  if (!products.length) {
    productsDiv.innerHTML = `<div class="no-products"><div>🔍</div>No products in this category.</div>`;
    return;
  }

  products.forEach((data) => {
    const realPrice = Number(data.price || 0);
    const oldPrice  = data.oldPrice ? Number(data.oldPrice) : null;
    const packQty   = data.packQty || "";
    const fewStock  = data.fewStock || false;
    const alreadyIn = inCartIds.has(data.id);

    const div = document.createElement("div");
    div.className = "card";
    div.dataset.productId = data.id;

    div.innerHTML = `
      ${fewStock ? `<div class="stock-badge">Few Stock</div>` : ""}
      <img src="${data.Image || 'logo.png'}" onerror="this.src='logo.png'">
      <h3>${data.name || "No Name"}</h3>
      ${packQty ? `<div class="pack">📦 ${packQty}</div>` : ""}
      <div class="price-box">
        ${oldPrice ? `<span class="old-price">₹${oldPrice}</span>` : ""}
        <span class="new-price">₹${realPrice}</span>
      </div>
      ${alreadyIn
        ? `<button class="buy-btn">⚡ Buy Now</button>`
        : `<button class="btn">🛒 Add Cart</button>`}
    `;

    div.addEventListener("click", () => {
      window.location = `product-details.html?id=${data.id}`;
    });

    const btn = div.querySelector(".btn, .buy-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.contains("btn") ? handleAddToCart(data, btn) : goToCheckout(data);
    });

    productsDiv.appendChild(div);
  });
}

/* ─── Add to Cart ─── */
async function handleAddToCart(product, btn) {
  if (btn.disabled) return;
  btn.disabled    = true;
  btn.textContent = "Adding…";

  const cart     = JSON.parse(localStorage.getItem("guestCart")) || [];
  const existing = cart.find(item => item.productId === product.id);
  if (existing) {
    existing.quantity++;
    existing.totalPrice = existing.unitPrice * existing.quantity;
  } else {
    cart.push({
      productId: product.id, name: product.name,
      image: product.Image || "logo.png", quantity: 1,
      pack: product.packQty || product.pack || "-",
      unitPrice: Number(product.price), totalPrice: Number(product.price)
    });
  }
  localStorage.setItem("guestCart", JSON.stringify(cart));

  if (currentUser) {
    try {
      const q = query(
        collection(db, "Cart"),
        where("uid", "==", currentUser.uid),
        where("productId", "==", product.id)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const cartDoc = snapshot.docs[0];
        const newQty  = (cartDoc.data().quantity || 1) + 1;
        await updateDoc(doc(db, "Cart", cartDoc.id), {
          quantity: newQty, totalPrice: Number(product.price) * newQty
        });
      } else {
        await addDoc(collection(db, "Cart"), {
          uid: currentUser.uid, productId: product.id,
          name: product.name, image: product.Image || "logo.png",
          quantity: 1, pack: product.packQty || product.pack || "-",
          unitPrice: Number(product.price), totalPrice: Number(product.price),
          createdAt: Date.now()
        });
      }
    } catch(err) {
      console.error("Firebase cart error:", err);
      btn.disabled = false; btn.textContent = "🛒 Add Cart";
      showToast("Error adding to cart.", true);
      return;
    }
  }

  inCartIds.add(product.id);
  btn.disabled  = false;
  btn.className = "buy-btn";
  btn.innerHTML = "⚡ Buy Now";
  btn.addEventListener("click", (e) => { e.stopPropagation(); goToCheckout(product); });
  showToast(`${product.name} added to cart!`);
}

/* ─── Buy Now ─── */
function goToCheckout(product) {
  sessionStorage.setItem("buyNowItem", JSON.stringify({
    productId: product.id, name: product.name,
    image: product.Image || "logo.png", quantity: 1,
    pack: product.packQty || product.pack || "-",
    unitPrice: Number(product.price), totalPrice: Number(product.price)
  }));
  sessionStorage.setItem("checkoutMode", "buyNow");
  window.location = "checkout.html";
}

/* ─── Search ─── */
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const s = searchInput.value.trim();
      if (s) window.location = `products.html?search=${encodeURIComponent(s)}`;
    }
  });
}
