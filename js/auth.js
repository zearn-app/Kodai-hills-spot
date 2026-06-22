import { auth, db } from "./firebase.js";

import {
RecaptchaVerifier,
signInWithPhoneNumber,
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let confirmationResult;

/* RECAPTCHA */
window.recaptchaVerifier = new RecaptchaVerifier(
auth,
"recaptcha-container",
{
size: "invisible"
}
);

/* SEND OTP */
document.getElementById("signupBtn").onclick = async () => {
try {

const phone = document.getElementById("phone").value.trim();

if (phone.length !== 10) {
alert("Enter valid 10-digit phone number");
return;
}

const appVerifier = window.recaptchaVerifier;

confirmationResult = await signInWithPhoneNumber(
auth,
"+91" + phone,
appVerifier
);

/* SHOW OTP UI */
document.getElementById("otp").style.display = "block";
document.getElementById("verifyOtpBtn").style.display = "block";

alert("OTP sent successfully");

} catch (error) {
alert(error.message);
}
};

/* VERIFY OTP + CREATE ACCOUNT */
document.getElementById("verifyOtpBtn").onclick = async () => {
try {

const code = document.getElementById("otp").value;

if (!code) {
alert("Enter OTP");
return;
}

await confirmationResult.confirm(code);

/* GET DATA */
const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const phone = document.getElementById("phone").value;

/* CREATE EMAIL ACCOUNT */
const userCredential = await createUserWithEmailAndPassword(
auth,
email,
password
);

const user = userCredential.user;

/* SAVE USER */
await setDoc(doc(db, "Users", user.uid), {
name,
email,
phone,
createdAt: Date.now()
});

alert("Signup successful");

window.location.href = "index.html";

} catch (error) {
alert(error.message);
}
};