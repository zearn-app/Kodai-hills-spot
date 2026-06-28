import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
    collection, query, where, getDocs, addDoc, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser   = null;
let checkoutItems = [];
let totalAmount   = 0;
let deliveryCharge = 0;

/* Holds the resolved delivery address for the order */
let resolvedAddress = null;

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

    const grandTotal = totalAmount + deliveryCharge;
    document.getElementById("total").innerText = `₹${grandTotal}`;
}

/* ─────────────── Load & display saved address ─────────────── */
async function loadSavedAddress(user) {
    const skeleton  = document.getElementById("addressSkeleton");
    const savedCard = document.getElementById("savedAddressCard");
    const form      = document.getElementById("addressForm");

    try {
        const userSnap = await getDoc(doc(db, "Users", user.uid));

        skeleton.style.display = "none";

        if (userSnap.exists()) {
            const data = userSnap.data();
            const addr = data.address || {};

            /* Trim all fields — empty strings ("") count as missing */
            const s = (v) => (v || "").toString().trim();
            const hasAddress =
                s(addr.state) && s(addr.district) &&
                s(addr.area)  && s(addr.street)   && s(addr.pincode);

            if (hasAddress) {
                /* Show saved address card */
                document.getElementById("savedName").innerText =
                    s(data.name) || user.displayName || "—";
                document.getElementById("savedPhone").innerText =
                    "📞 " + (s(data.phone) || "—");
                document.getElementById("savedLines").innerHTML =
                    `${s(addr.area)}, ${s(addr.street)}<br>
                     ${s(addr.district)}, ${s(addr.state)} – ${s(addr.pincode)}`;

                savedCard.style.display = "block";
                form.style.display = "none";

                /* Cache as resolved address */
                resolvedAddress = {
                    name:     s(data.name)  || user.displayName || "",
                    phone:    s(data.phone) || "",
                    email:    s(data.email) || "",
                    state:    s(addr.state),
                    district: s(addr.district),
                    area:     s(addr.area),
                    street:   s(addr.street),
                    pincode:  s(addr.pincode)
                };
                return;
            }

            /* Address exists but is incomplete — pre-fill what we have */
            const nameField  = document.getElementById("name");
            const phoneField = document.getElementById("phone");
            const emailField = document.getElementById("email");
            const areaField  = document.getElementById("area");
            const streetField= document.getElementById("street");
            const pinField   = document.getElementById("pincode");

            if (nameField  && s(data.name))   nameField.value   = s(data.name);
            if (phoneField && s(data.phone))   phoneField.value  = s(data.phone);
            if (emailField && s(data.email))   emailField.value  = s(data.email);
            if (areaField  && s(addr.area))    areaField.value   = s(addr.area);
            if (streetField&& s(addr.street))  streetField.value = s(addr.street);
            if (pinField   && s(addr.pincode)) pinField.value    = s(addr.pincode);

            /* Pre-select state & district dropdowns if saved */
            if (s(addr.state)) {
                window.selectedState = s(addr.state);
                const stateEl = document.getElementById("stateSelect");
                if (stateEl) { stateEl.innerText = s(addr.state); stateEl.classList.add("selected"); }
            }
            if (s(addr.district)) {
                window.selectedDistrict = s(addr.district);
                const distEl = document.getElementById("districtSelect");
                if (distEl) { distEl.innerText = s(addr.district); distEl.classList.add("selected"); }
            }
        }

        /* No complete saved address — show form */
        savedCard.style.display = "none";
        form.style.display      = "block";

    } catch (err) {
        console.error("Error loading saved address:", err);
        skeleton.style.display = "none";
        form.style.display     = "block";
    }
}

/* ─────────────── Collect address from form ─────────────── */
function collectFormAddress() {
    const name     = document.getElementById("name").value.trim();
    const phone    = document.getElementById("phone").value.trim();
    const email    = document.getElementById("email").value.trim();
    const state    = window.selectedState;
    const district = window.selectedDistrict;
    const area     = document.getElementById("area").value.trim();
    const street   = document.getElementById("street").value.trim();
    const pincode  = document.getElementById("pincode").value.trim();

    if (!name || !phone || !email || !state || !district || !area || !street || !pincode) {
        showPopup("Missing Information", "Please fill in all delivery details.", "error");
        return null;
    }

    return { name, phone, email, state, district, area, street, pincode };
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
            const raw = sessionStorage.getItem("buyNowItem");
            if (raw) {
                const item = JSON.parse(raw);
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
            const q        = query(
                collection(db, "Cart"),
                where("uid", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);

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
            const raw = JSON.parse(localStorage.getItem("guestCart")) || [];

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

        const allFree = checkoutItems.every(item => item.freeDelivery === true);
        updateDeliveryRow(allFree);

    } catch (err) {
        console.error("Checkout load error:", err);
        orderItems.innerHTML =
            `<p style="text-align:center;color:#e53935;padding:20px;">Error loading items.</p>`;
    }
}

/* ─────────────── Auth ─────────────── */
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location = "login.html"; return; }
    currentUser = user;

    /* Load address first, then items in parallel */
    await loadSavedAddress(user);
    loadCheckout();
});

/* ─────────────── Place Order ─────────────── */
document.getElementById("placeOrder").onclick = async () => {

    /* Decide which address to use */
    const form      = document.getElementById("addressForm");
    const formVisible = form && form.style.display !== "none";

    let addr;
    if (formVisible || window.usingNewAddress) {
        /* User filled in the form (new or changed address) */
        addr = collectFormAddress();
        if (!addr) return; /* validation failed */
    } else {
        /* Use cached saved address */
        addr = resolvedAddress;
        if (!addr) {
            showPopup("Missing Information", "Please provide a delivery address.", "error");
            return;
        }
    }

    if (checkoutItems.length === 0) {
        showPopup("Cart Empty", "No items to order.", "error");
        return;
    }

    const grandTotal = totalAmount + deliveryCharge;

    /* Save / update address in Firestore for next time */
    try {
        await setDoc(doc(db, "Users", currentUser.uid), {
            name:  addr.name,
            phone: addr.phone,
            email: addr.email,
            uid:   currentUser.uid,
            address: {
                state:    addr.state,
                district: addr.district,
                area:     addr.area,
                street:   addr.street,
                pincode:  addr.pincode
            }
        }, { merge: true });
    } catch (e) {
        console.warn("Could not save address:", e);
    }

    const options = {
        key:         "rzp_test_T5tWAjBQVPNBI4",
        amount:      grandTotal * 100,
        currency:    "INR",
        name:        "Kodai Hills Spot",
        description: "Order Payment",
        image:       "logo.png",
        prefill:     { name: addr.name, contact: addr.phone, email: addr.email },
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
                        customerName:  addr.name,
                        phone:         addr.phone,
                        email:         addr.email,
                        state:         addr.state,
                        district:      addr.district,
                        area:          addr.area,
                        street:        addr.street,
                        pincode:       addr.pincode,
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
