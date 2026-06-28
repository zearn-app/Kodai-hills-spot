import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
    collection, query, where, getDocs, addDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser   = null;
let checkoutItems = [];
let totalAmount   = 0;
let deliveryCharge = 0;   // ← determined per-order

/* ── Delegates to global showPopup defined in checkout.html ── */
function showPopup(title, message, type = "info") {
    window.showPopup(title, message, type);
}

/* ─────────────── Delivery row updater ─────────────── */
function updateDeliveryRow(isFree) {
    const deliveryCell = document.getElementById("deliveryCell");
    if (!deliveryCell) return;

    if (isFree) {
        deliveryCharge = 0;
        deliveryCell.innerHTML = `
          <span class="old-price">₹50</span>
          <span class="free-tag">FREE</span>`;
    } else {
        deliveryCharge = 50;
        deliveryCell.innerHTML = `<span style="font-weight:700;color:#c62828;">₹50</span>`;
    }

    /* Recalculate total */
    const grandTotal = totalAmount + deliveryCharge;
    document.getElementById("total").innerText = `₹${grandTotal}`;
}

/* ─────────────── Load checkout items ─────────────── */
async function loadCheckout() {
    const orderItems = document.getElementById("orderItems");
    if (!orderItems) return;

    checkoutItems = [];
    totalAmount   = 0;

    const mode = sessionStorage.getItem("checkoutMode");

    try {
        if (mode === "buyNow") {
            /*
             * Direct Buy Now — single item stored by products.js / home.js
             * Also fetch the product doc from Firestore to get freeDelivery flag.
             */
            const raw = sessionStorage.getItem("buyNowItem");
            if (raw) {
                const item = JSON.parse(raw);

                /* Fetch freeDelivery from Firestore */
                try {
                    const productSnap = await getDoc(doc(db, "Products", item.productId));
                    if (productSnap.exists()) {
                        item.freeDelivery = productSnap.data().freeDelivery || false;
                    }
                } catch (e) {
                    item.freeDelivery = false;
                }

                checkoutItems = [item];
            }
            sessionStorage.removeItem("buyNowItem");
            sessionStorage.removeItem("checkoutMode");

        } else if (currentUser) {
            /* Normal cart flow — load full Firebase Cart */
            const q        = query(
                collection(db, "Cart"),
                where("uid", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);

            /* For each cart item, also fetch the product to get freeDelivery */
            const fetchPromises = snapshot.docs.map(async (d) => {
                const item = d.data();
                try {
                    const productSnap = await getDoc(doc(db, "Products", item.productId));
                    item.freeDelivery = productSnap.exists()
                        ? (productSnap.data().freeDelivery || false)
                        : false;
                } catch (e) {
                    item.freeDelivery = false;
                }
                return item;
            });

            checkoutItems = await Promise.all(fetchPromises);

        } else {
            /* Guest fallback */
            const raw = JSON.parse(localStorage.getItem("guestCart")) || [];

            /* Fetch freeDelivery for each guest cart item */
            const fetchPromises = raw.map(async (item) => {
                try {
                    const productSnap = await getDoc(doc(db, "Products", item.productId));
                    item.freeDelivery = productSnap.exists()
                        ? (productSnap.data().freeDelivery || false)
                        : false;
                } catch (e) {
                    item.freeDelivery = false;
                }
                return item;
            });

            checkoutItems = await Promise.all(fetchPromises);
        }

        /* ── Render items ── */
        if (checkoutItems.length === 0) {
            orderItems.innerHTML = `
              <div style="text-align:center;padding:30px 10px;">
                <div style="font-size:48px;margin-bottom:10px;">🛒</div>
                <p style="color:#999;font-size:15px;">Your cart is empty</p>
              </div>`;
            document.getElementById("subtotal").innerText = "₹0";
            document.getElementById("total").innerText    = "₹0";
            return;
        }

        let html = "";
        checkoutItems.forEach(item => {
            const qty       = Number(item.quantity   || 1);
            const unitPrice = Number(item.unitPrice  || item.price || 0);
            const itemTotal = Number(item.totalPrice || unitPrice * qty);
            totalAmount    += itemTotal;

            html += `
            <div class="product-card">
              <div class="product-img-wrap">
                <img src="${item.image || 'logo.png'}"
                     onerror="this.src='logo.png'"
                     alt="${item.name || ''}">
              </div>
              <div class="product-info">
                <div class="product-name">${item.name || "Product"}</div>
                <div class="product-price">₹${itemTotal}</div>
                <div class="product-meta">
                  <span>Unit Price: ₹${unitPrice}</span>
                  <span>Qty: ${qty} &nbsp;|&nbsp; Pack: ${item.pack || item.selectedSize || "-"}</span>
                </div>
              </div>
            </div>`;
        });

        orderItems.innerHTML = html;
        document.getElementById("subtotal").innerText = `₹${totalAmount}`;

        /*
         * Delivery logic:
         * FREE if ALL items in the order have freeDelivery === true.
         * ₹50 if even ONE item does not have free delivery.
         */
        const allFree = checkoutItems.every(item => item.freeDelivery === true);
        updateDeliveryRow(allFree);

    } catch (err) {
        console.error("Checkout load error:", err);
        orderItems.innerHTML =
            `<p style="text-align:center;color:#e53935;padding:20px;">Error loading items.</p>`;
    }
}

/* ─────────────── Auth ─────────────── */
onAuthStateChanged(auth, (user) => {
    if (!user) { window.location = "login.html"; return; }
    currentUser = user;
    loadCheckout();
});

/* ─────────────── Place Order ─────────────── */
document.getElementById("placeOrder").onclick = async () => {

    const name     = document.getElementById("name").value.trim();
    const phone    = document.getElementById("phone").value.trim();
    const state    = window.selectedState;
    const district = window.selectedDistrict;
    const area     = document.getElementById("area").value.trim();
    const street   = document.getElementById("street").value.trim();
    const pincode  = document.getElementById("pincode").value.trim();

    if (!name || !phone || !state || !district || !area || !street || !pincode) {
        showPopup("Missing Information", "Please fill in all delivery details.", "error");
        return;
    }
    if (checkoutItems.length === 0) {
        showPopup("Cart Empty", "No items to order.", "error");
        return;
    }

    const grandTotal = totalAmount + deliveryCharge;

    const options = {
        key:         "rzp_test_T5tWAjBQVPNBI4",
        amount:      grandTotal * 100,
        currency:    "INR",
        name:        "Kodai Hills Spot",
        description: "Order Payment",
        image:       "logo.png",
        prefill:     { name, contact: phone, email: currentUser?.email || "" },
        theme:       { color: "#2e7d32" },

        handler: async function(response) {
            try {
                for (const item of checkoutItems) {
                    await addDoc(collection(db, "Orders"), {
                        uid:           currentUser.uid,
                        name:          item.name,
                        image:         item.image,
                        quantity:      item.quantity,
                        price:         item.unitPrice || item.price,
                        pack:          item.selectedSize || item.pack || "-",
                        customerName:  name,
                        phone, state, district, area, street, pincode,
                        deliveryCharge,
                        grandTotal,
                        paymentId:     response.razorpay_payment_id,
                        status:        "Pending",
                        createdAt:     new Date()
                    });
                }
                showPopup("Order Placed! 🎉", "Your order was placed successfully.", "success");
            } catch (err) {
                console.error("Order save error:", err);
                showPopup("Error", "Order could not be saved. Please contact support.", "error");
            }
        },

        modal: {
            ondismiss() {
                showPopup("Cancelled", "Payment was cancelled.", "error");
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", () => {
        showPopup("Failed", "Payment failed. Please retry.", "error");
    });
    rzp.open();
};
