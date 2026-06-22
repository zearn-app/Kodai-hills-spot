import { auth } from "./firebase.js";

import {
RecaptchaVerifier,
signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

let confirmationResult;

/* ---------------- SAFE INIT (IMPORTANT FIX) ---------------- */
async function initRecaptcha() {
window.recaptchaVerifier = new RecaptchaVerifier(
auth,
"recaptcha-container",
{
size: "invisible"
}
);

await window.recaptchaVerifier.render();
}

document.addEventListener("DOMContentLoaded", initRecaptcha);

/* ---------------- SEND OTP ---------------- */
document.getElementById("signupBtn").addEventListener("click", async () => {
try {

const phone = document.getElementById("phone").value.trim();

if (!phone || phone.length !== 10) {
alert("Enter valid 10-digit number");
return;
}

if (!window.recaptchaVerifier) {
alert("Recaptcha not ready. Reload page.");
return;
}

confirmationResult = await signInWithPhoneNumber(
auth,
"+91" + phone,
window.recaptchaVerifier
);

document.getElementById("otp").style.display = "block";
document.getElementById("verifyOtpBtn").style.display = "block";

alert("OTP Sent Successfully");

} catch (error) {
console.log(error);
alert(error.message);
}
});

/* ---------------- VERIFY OTP ---------------- */
document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
try {

const code = document.getElementById("otp").value;

if (!confirmationResult) {
alert("Send OTP first");
return;
}

await confirmationResult.confirm(code);

alert("Phone Verified Successfully");

} catch (error) {
console.log(error);
alert(error.message);
}
});