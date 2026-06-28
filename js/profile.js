import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const nameEl    = document.getElementById("name");
const emailEl   = document.getElementById("email");
const phoneEl   = document.getElementById("phone");
const addressEl = document.getElementById("address");


onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location = "login.html";
        return;
    }

    try {

        const userSnap = await getDoc(doc(db, "Users", user.uid));

        if (userSnap.exists()) {

            const data = userSnap.data();

            nameEl.innerText  = data.name  || "No Name";
            emailEl.innerText = data.email || user.email;
            phoneEl.innerText = data.phone || "No Phone";

            /* ── Format address map into a readable string ── */
            const addr = data.address;

            if (addr && typeof addr === "object") {
                const parts = [
                    addr.area,
                    addr.street,
                    addr.district,
                    addr.state,
                    addr.pincode
                ].filter(v => v && v.toString().trim());   // drop empty fields

                addressEl.innerText = parts.length
                    ? parts.join(", ")
                    : "No Address";
            } else {
                addressEl.innerText = addr || "No Address";
            }

        } else {

            nameEl.innerText    = "User data not found";
            emailEl.innerText   = user.email;
            phoneEl.innerText   = "-";
            addressEl.innerText = "-";
            console.log("No Firestore document");

        }

    } catch (error) {

        console.log(error);
        nameEl.innerText = "Error loading profile";

    }

});


// Edit Profile Button
document.getElementById("editProfileBtn")
    .addEventListener("click", () => {
        window.location = "edit-profile.html";
    });


// Logout Button
document.getElementById("logoutBtn")
    .addEventListener("click", async () => {
        await signOut(auth);
        window.location = "login.html";
    });
