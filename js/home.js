import { db, auth } from "./firebase.js";
import {
    collection, getDocs, addDoc,
    query, where, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const productsDiv   = document.getElementById("products");
const profileNav    = document.getElementById("profileNav");
const searchInput   = document.querySelector(".search input");
const categoryCards = document.querySelectorAll(".category-card");

let allProducts = [];
let currentUser = null;

/* Tracks which productIds are already in cart so button stays "Buy Now" */
const inCartIds = new Set();

/* ─────────────── Dynamic Styles ─────────────── */
const style = document.createElement("style");
style.innerHTML = `
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
.card h3 {
  margin-top: 10px;
  font-size: 16px;
}
.stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: red;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
}
.pack {
  margin-top: 5px;
  font-size: 13px;
  font-weight: bold;
  color: #666;
}
.price-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}
.old-price {
  color: #ff3b30;
  font-size: 15px;
  opacity: .7;
  text-decoration: line-through;
}
.new-price {
  color: #2e7d32;
  font-size: 22px;
  font-weight: bold;
}
.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #2e7d32;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: auto;
}
.btn:active { transform: scale(.95); }
.buy-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #ff6f00, #ffa000);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(255,111,0,.35);
  letter-spacing: .3px;
}
.buy-btn:active { transform: scale(.95); box-shadow: none; }

/* Toast */
.home-toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #2e7d32;
  color: white;
  padding: 11px 22px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transition: .3s;
  z-index: 9999;
  white-space: nowrap;
  pointer-events: none;
}
.home-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
`;
document.head.appendChild(style);

/* ─────────────── Toast ─────────────── */
let toastEl = document.createElement("div");
toastEl.className = "home-toast";
document.body.appendChild(toastEl);

function showToast(msg, isError = false) {
    toastEl.textContent = isError ? `✗ ${msg}` : `✓ ${msg}`;
    toastEl.style.background = isError ? "#c62828" : "#2e7d32";
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2400);
}

/* ─────────────── Auth ─────────────── */
onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (profileNav) {
        profileNav.href      = user ? "profile.html" : "login.html";
        profileNav.innerHTML = user ? "👤<br>Yours" : "🔐<br>Login";
    }

    if (user) {
        /* Pre-load which products are already in Firebase cart */
        try {
            const q        = query(collection(db, "Cart"), where("uid", "==", user.uid));
            const snapshot = await getDocs(q);
            snapshot.forEach(d => inCartIds.add(d.data().productId));
        } catch (e) {
            console.error("Pre-load cart error:", e);
        }
    } else {
        /* Pre-load from local guest cart */
        const local = JSON.parse(localStorage.getItem("guestCart")) || [];
        local.forEach(item => inCartIds.add(item.productId));
    }

    /* Now load & render products (after we know what's in cart) */
    loadProducts();
});

/* ─────────────── Load Products ─────────────── */
async function loadProducts() {
    try {
        productsDiv.innerHTML = `<h3 style="text-align:center;padding:20px;">Loading...</h3>`;

        const snapshot = await getDocs(collection(db, "Products"));

        if (snapshot.empty) {
            productsDiv.innerHTML = `<h3 style="text-align:center;padding:20px;">No Products Available</h3>`;
            return;
        }

        allProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        renderProducts(allProducts);

    } catch (error) {
        console.error(error);
        productsDiv.innerHTML = `<h3 style="text-align:center;padding:20px;color:red;">Error Loading Products</h3>`;
    }
}

/* ─────────────── Render Products ─────────────── */
function renderProducts(products) {
    productsDiv.innerHTML = "";

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
            : `<button class="btn">🛒 Add Cart</button>`
          }
        `;

        /* Card click → product details */
        div.addEventListener("click", () => {
            window.location = `product-details.html?id=${data.id}`;
        });

        /* Button click */
        const btn = div.querySelector(".btn, .buy-btn");
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (btn.classList.contains("btn")) {
                handleAddToCart(data, btn);
            } else {
                goToCheckout(data);
            }
        });

        productsDiv.appendChild(div);
    });
}

/* ─────────────── Add to Cart ─────────────── */
async function handleAddToCart(product, btn) {
    if (btn.disabled) return;
    btn.disabled    = true;
    btn.textContent = "Adding…";

    /* 1 — Local guest cart (dedup) */
    const cart     = JSON.parse(localStorage.getItem("guestCart")) || [];
    const existing = cart.find(item => item.productId === product.id);

    if (existing) {
        existing.quantity++;
        existing.totalPrice = existing.unitPrice * existing.quantity;
    } else {
        cart.push({
            productId:  product.id,
            name:       product.name,
            image:      product.Image || "logo.png",
            quantity:   1,
            pack:       product.packQty || product.pack || "-",
            unitPrice:  Number(product.price),
            totalPrice: Number(product.price)
        });
    }
    localStorage.setItem("guestCart", JSON.stringify(cart));

    /* 2 — Firebase cart (dedup) */
    if (currentUser) {
        try {
            const q        = query(
                collection(db, "Cart"),
                where("uid",       "==", currentUser.uid),
                where("productId", "==", product.id)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const cartDoc = snapshot.docs[0];
                const newQty  = (cartDoc.data().quantity || 1) + 1;
                await updateDoc(doc(db, "Cart", cartDoc.id), {
                    quantity:   newQty,
                    totalPrice: Number(product.price) * newQty
                });
            } else {
                await addDoc(collection(db, "Cart"), {
                    uid:        currentUser.uid,
                    productId:  product.id,
                    name:       product.name,
                    image:      product.Image || "logo.png",
                    quantity:   1,
                    pack:       product.packQty || product.pack || "-",
                    unitPrice:  Number(product.price),
                    totalPrice: Number(product.price),
                    createdAt:  Date.now()
                });
            }
        } catch (err) {
            console.error("Firebase cart error:", err);
            btn.disabled    = false;
            btn.textContent = "🛒 Add Cart";
            showToast("Error adding to cart. Try again.", true);
            return;
        }
    }

    /* 3 — Mark as in-cart */
    inCartIds.add(product.id);

    /* 4 — Swap to "Buy Now" button */
    btn.disabled  = false;
    btn.className = "buy-btn";
    btn.innerHTML = "⚡ Buy Now";

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        goToCheckout(product);
    });

    /* 5 — Feedback */
    showToast(`${product.name} added to cart!`);
}

/* ─────────────── Buy Now → Checkout ─────────────── */
function goToCheckout(product) {
    const buyNowItem = {
        productId:  product.id,
        name:       product.name,
        image:      product.Image || "logo.png",
        quantity:   1,
        pack:       product.packQty || product.pack || "-",
        unitPrice:  Number(product.price),
        totalPrice: Number(product.price)
    };

    sessionStorage.setItem("buyNowItem",   JSON.stringify(buyNowItem));
    sessionStorage.setItem("checkoutMode", "buyNow");

    window.location = "checkout.html";
}

/* ─────────────── Product Detail Page ─────────────── */
window.openProduct = (id) => {
    window.location = `product-details.html?id=${id}`;
};

/* ─────────────── Category Click ─────────────── */
categoryCards.forEach((card) => {
    card.onclick = () => {
        const category = card.innerText.replace(/[🍫🥑🥔🌿]/g, "").trim();
        window.location = `products.html?category=${encodeURIComponent(category)}`;
    };
});

/* ─────────────── Search ─────────────── */
if (searchInput) {
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const search = searchInput.value.trim();
            if (search) {
                window.location = `products.html?search=${encodeURIComponent(search)}`;
            }
        }
    });
}

/* ─────────────── About Link ─────────────── */
const aboutLink = document.getElementById("aboutLink");
if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "about.html";
    });
}
