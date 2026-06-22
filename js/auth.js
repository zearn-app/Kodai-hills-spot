import { auth } from "./firebase.js";

import {
RecaptchaVerifier,
signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

let confirmationResult;

/* SAFE INIT */
function initRecaptcha() {
try {
window.recaptchaVerifier = new RecaptchaVerifier(
auth,
"recaptcha-container",
{
size: "invisible"
}
);

window.recaptchaVerifier.render();

console.log("Recaptcha ready");
} catch (e) {
console.error("Recaptcha error:", e);
}
}

/* WAIT FOR FULL PAGE LOAD */
window.addEventListener("load", () => {
initRecaptcha();
attachEvents();
});

/* ATTACH BUTTON EVENTS SAFELY */
function attachEvents() {

const btn = document.getElementById("signupBtn");

if (!btn) {
console.error("Signup button not found");
return;
}

btn.addEventListener("click", sendOTP);
}

/* SEND OTP */
async function sendOTP() {
try {

console.log("Send OTP clicked");

const phone = document.getElementById("phone").value.trim();

if (!phone || phone.length !== 10) {
alert("Enter valid phone number");
return;
}

if (!window.recaptchaVerifier) {
alert("Recaptcha not ready");
return;
}

confirmationResult = await signInWithPhoneNumber(
auth,
"+91" + phone,
window.recaptchaVerifier
);

document.getElementById("otp").style.display = "block";
document.getElementById("verifyOtpBtn").style.display = "block";

alert("OTP sent successfully");

} catch (error) {
console.error(error);
alert("OTP Error: " + error.message);
}
}

/* VERIFY OTP */
document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
try {

const code = document.getElementById("otp").value;

if (!confirmationResult) {
alert("Send OTP first");
return;
}

await confirmationResult.confirm(code);

alert("Phone Verified");

} catch (error) {
console.error(error);
alert(error.message);
}
});