import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser = null;
let checkoutItems = [];
let totalAmount = 0;

/* Popup helper — delegates to the global defined in HTML */
function showPopup(title, message, type = "info") {
    window.showPopup(title, message, type);
}

/* Load Items logic */
async function loadCheckout() {
    const orderItems = document.getElementById("orderItems");
    if (!orderItems) return;

    checkoutItems = [];
    totalAmount = 0;

    try {
        if (currentUser) {
            // Fetch from Firebase
            const q = query(collection(db, "Cart"), where("uid", "==", currentUser.uid));
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => checkoutItems.push(doc.data()));
        } else {
            // Fallback to LocalStorage
            checkoutItems = JSON.parse(localStorage.getItem("checkoutItems")) || [];
        }

        if (checkoutItems.length === 0) {
            orderItems.innerHTML = `<div style="text-align:center; padding:30px;"><h2>🛒 Cart Empty</h2></div>`;
            document.getElementById("subtotal").innerText = "₹0";
            document.getElementById("total").innerText = "₹0";
            return;
        }

        let html = "";
        checkoutItems.forEach(item => {
            const qty = Number(item.quantity || 1);
            const unitPrice = Number(item.unitPrice || item.price || 0);
            const itemTotal = Number(item.totalPrice || (unitPrice * qty));
            totalAmount += itemTotal;

            html += `
            <div class="product" style="margin-bottom:20px; padding:15px; background:#fafafa; border-radius:15px;">
                <img src="${item.image || 'logo.png'}" onerror="this.src='logo.png'">
                <div class="details">
                    <h3>${item.name || "No Product"}</h3>
                    <div class="price">₹${itemTotal}</div>
                    <p>Unit Price : ₹${unitPrice}</p>
                    <p>Qty : ${qty}</p>
                    <p>Pack : ${item.pack || "-"}</p>
                </div>
            </div>`;
        });

        orderItems.innerHTML = html;
        document.getElementById("subtotal").innerText = `₹${totalAmount}`;
        document.getElementById("total").innerText = `₹${totalAmount}`;

    } catch (error) {
        console.error("Error loading checkout:", error);
        orderItems.innerHTML = `<p style="text-align:center;">Error loading items.</p>`;
    }
}

/* Authentication Check */
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location = "login.html";
        return;
    }
    currentUser = user;
    loadCheckout();
});

/* Place Order Logic */
document.getElementById("placeOrder").onclick = async () => {

    const name     = document.getElementById("name").value.trim();
    const phone    = document.getElementById("phone").value.trim();
    const state    = window.selectedState;
    const district = window.selectedDistrict;
    const area     = document.getElementById("area").value.trim();
    const street   = document.getElementById("street").value.trim();
    const pincode  = document.getElementById("pincode").value.trim();

    if (!name || !phone || !state || !district || !area || !street || !pincode) {
        showPopup("Missing Information", "Please fill all fields", "error");
        return;
    }

    if (checkoutItems.length === 0) {
        showPopup("Cart Empty", "No items available", "error");
        return;
    }

    const options = {
        key: "rzp_test_T5tWAjBQVPNBI4",
        amount: totalAmount * 100,
        currency: "INR",
        name: "Kodai Hills Spot",
        description: "Order Payment",
        image: "logo.png",
        prefill: {
            name: name,
            contact: phone,
            email: currentUser?.email || ""
        },
        theme: { color: "#2e7d32" },

        handler: async function(response) {
            try {
                for (let item of checkoutItems) {
                    await addDoc(collection(db, "Orders"), {
                        uid:          currentUser.uid,
                        name:         item.name,
                        image:        item.image,
                        quantity:     item.quantity,
                        price:        item.price,
                        pack:         item.selectedSize || "-",
                        customerName: name,
                        phone:        phone,
                        state:        state,
                        district:     district,
                        area:         area,
                        street:       street,
                        pincode:      pincode,
                        paymentId:    response.razorpay_payment_id,
                        status:       "Pending",
                        createdAt:    new Date()
                    });
                }
                showPopup("Success", "Order placed successfully", "success");
            } catch (error) {
                console.log(error);
                showPopup("Error", "Order saving failed", "error");
            }
        },

        modal: {
            ondismiss() {
                showPopup("Cancelled", "Payment cancelled", "error");
            }
        }
    };

    const razorpay = new Razorpay(options);
    razorpay.on("payment.failed", () => {
        showPopup("Failed", "Payment failed", "error");
    });
    razorpay.open();
};