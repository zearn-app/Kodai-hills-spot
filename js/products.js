import { db, auth } from "./firebase.js";
import {
    collection, getDocs, addDoc,
    query, where, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ─────────────── State ─────────────── */
const productsDiv   = document.getElementById("products");
const searchInput   = document.getElementById("searchInput");
const filterOverlay = document.getElementById("filterOverlay");
const profileNav    = document.getElementById("profileNav");
const toast         = document.getElementById("toast");
const categoryCards = document.querySelectorAll(".category-card");

let allProducts      = [];
let currentUser      = null;
let priceFilter      = "";
let selectedCategory = "";

/*
 * inCartIds — tracks which productIds are already in cart
 * so the button stays "Buy Now" even after filter/search re-renders.
 */
const inCartIds = new Set();

/* ─────────────── Auth ─────────────── */
onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        profileNav.href      = "profile.html";
        profileNav.innerHTML = "👤<br>Yours";

        /* Pre-load which products this user already has in Firebase cart */
        try {
            const q        = query(collection(db, "Cart"), where("uid", "==", user.uid));
            const snapshot = await getDocs(q);
            snapshot.forEach(d => inCartIds.add(d.data().productId));
            /* Re-render so existing cart items show Buy Now immediately */
            applyFilters();
        } catch (e) {
            console.error("Pre-load cart error:", e);
        }
    } else {
        profileNav.href      = "login.html";
        profileNav.innerHTML = "🔐<br>Login";

        /* Pre-load from local guest cart */
        const local = JSON.parse(localStorage.getItem("guestCart")) || [];
        local.forEach(item => inCartIds.add(item.productId));
        applyFilters();
    }
});

/* ─────────────── Load products ─────────────── */
async function loadProducts() {
    try {
        const snapshot = await getDocs(collection(db, "Products"));
        allProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        showProducts(allProducts);
    } catch (err) {
        console.error("Load error:", err);
        productsDiv.innerHTML =
            `<p style="color:red;padding:20px;grid-column:1/-1">Failed to load products.</p>`;
    }
}

/* ─────────────── Render cards ─────────────── */
function showProducts(products) {
    productsDiv.innerHTML = "";

    if (products.length === 0) {
        productsDiv.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:40px 0;">
            <div style="font-size:48px;margin-bottom:10px;">🔍</div>
            <p style="color:#999;font-size:15px;">No products found</p>
          </div>`;
        return;
    }

    products.forEach((product, i) => {
        const oldPrice  = product.oldPrice || (Number(product.price) + 50);
        const alreadyIn = inCartIds.has(product.id);

        const div = document.createElement("div");
        div.className = "card";
        div.style.animationDelay = `${i * 0.06}s`;
        div.dataset.productId = product.id;

        div.innerHTML = `
          <img class="card-img"
               src="${product.Image || 'logo.png'}"
               onerror="this.src='logo.png'"
               alt="${product.name}">
          <div class="card-name">${product.name}</div>
          <div class="price-row">
            <span class="old-price">₹${oldPrice}</span>
            <span class="price">₹${product.price}</span>
          </div>
          ${alreadyIn
            ? `<button class="buy-btn">⚡ Buy Now</button>`
            : `<button class="add-btn">🛒 Add to Cart</button>`
          }
        `;

        /* Card click → product details */
        div.addEventListener("click", () => {
            window.location = `product-details.html?id=${product.id}`;
        });

        /* Button logic */
        const btn = div.querySelector(".add-btn, .buy-btn");
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (btn.classList.contains("add-btn")) {
                handleAddToCart(product, btn);
            } else {
                goToCheckout(product);
            }
        });

        productsDiv.appendChild(div);
    });
}

/* ─────────────── Add to cart ─────────────── */
async function handleAddToCart(product, btn) {
    if (btn.disabled) return;
    btn.disabled    = true;
    btn.textContent = "Adding…";

    /* 1 ─ Local guest cart (dedup) */
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
            pack:       product.pack || "-",
            unitPrice:  Number(product.price),
            totalPrice: Number(product.price)
        });
    }
    localStorage.setItem("guestCart", JSON.stringify(cart));

    /* 2 ─ Firebase cart (dedup) */
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
                    pack:       product.pack || "-",
                    unitPrice:  Number(product.price),
                    totalPrice: Number(product.price),
                    createdAt:  Date.now()
                });
            }
        } catch (err) {
            console.error("Firebase cart error:", err);
            btn.disabled    = false;
            btn.textContent = "🛒 Add to Cart";
            showToast("Error adding to cart. Try again.", true);
            return;
        }
    }

    /* 3 ─ Mark as in-cart */
    inCartIds.add(product.id);

    /* 4 ─ Swap button to "Buy Now" */
    btn.disabled = false;
    btn.className   = "buy-btn";
    btn.textContent = "⚡ Buy Now";

    /* Re-attach click for buy now */
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        goToCheckout(product);
    });

    /* 5 ─ Feedback */
    showToast(`${product.name} added to cart!`);
    const cartBtn = document.querySelector(".cart-btn");
    cartBtn.style.transform = "scale(1.3)";
    setTimeout(() => { cartBtn.style.transform = "scale(1)"; }, 300);
}

/* ─────────────── Buy Now → Checkout ─────────────── */
function goToCheckout(product) {
    /*
     * Store a single-item checkout payload in sessionStorage.
     * checkout.js reads window.checkoutSource to decide whether to
     * load from Firebase Cart or from this direct buy.
     *
     * We pass everything checkout.js needs to render the order summary.
     */
    const buyNowItem = {
        productId:  product.id,
        name:       product.name,
        image:      product.Image || "logo.png",
        quantity:   1,
        pack:       product.pack || "-",
        unitPrice:  Number(product.price),
        totalPrice: Number(product.price)
    };

    /* Tag the source so checkout knows to use this item, not the full cart */
    sessionStorage.setItem("buyNowItem",   JSON.stringify(buyNowItem));
    sessionStorage.setItem("checkoutMode", "buyNow");

    window.location = "checkout.html";
}

/* ─────────────── Toast ─────────────── */
function showToast(msg, isError = false) {
    toast.textContent = isError ? `✗ ${msg}` : `✓ ${msg}`;
    toast.style.background = isError ? "#c62828" : "#2e7d32";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ─────────────── Filter & search ─────────────── */
function applyFilters() {
    let list = [...allProducts];

    const term = searchInput.value.toLowerCase().trim();
    if (term) {
        list = list.filter(p => (p.name || "").toLowerCase().includes(term));
    }
    if (selectedCategory) {
        list = list.filter(p =>
            (p.category || "").toLowerCase() === selectedCategory.toLowerCase()
        );
    }
    if (priceFilter === "low")  list.sort((a, b) => Number(a.price) - Number(b.price));
    if (priceFilter === "high") list.sort((a, b) => Number(b.price) - Number(a.price));

    showProducts(list);
}

searchInput.addEventListener("input", applyFilters);

/* ─────────────── Category pills ─────────────── */
categoryCards.forEach(card => {
    card.addEventListener("click", () => {
        const clicked = card.dataset.category;
        if (selectedCategory === clicked) {
            selectedCategory = "";
            card.classList.remove("active");
        } else {
            categoryCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedCategory = clicked;
        }
        applyFilters();
    });
});

/* ─────────────── Filter popup ─────────────── */
document.getElementById("openFilter").addEventListener("click", () => {
    filterOverlay.style.display = "flex";
});
document.getElementById("closeFilter").addEventListener("click", () => {
    filterOverlay.style.display = "none";
});
filterOverlay.addEventListener("click", (e) => {
    if (e.target === filterOverlay) filterOverlay.style.display = "none";
});
document.querySelectorAll(".popup-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        priceFilter = btn.dataset.value;
        document.querySelectorAll(".popup-btn").forEach(b => b.classList.remove("active-filter"));
        if (priceFilter) btn.classList.add("active-filter");
        applyFilters();
        filterOverlay.style.display = "none";
    });
});

/* ─────────────── Init ─────────────── */
loadProducts();
