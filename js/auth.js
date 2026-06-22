import { auth } from "./firebase.js";

import {
RecaptchaVerifier,
signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

let confirmationResult;

function log(msg){
const debug = document.getElementById("debug");
debug.innerHTML += "<br>" + msg;
console.log(msg);
}

/* INIT */
window.addEventListener("load", () => {
log("Page loaded");

try {
window.recaptchaVerifier = new RecaptchaVerifier(
auth,
"recaptcha-container",
{
size: "invisible"
}
);

window.recaptchaVerifier.render();

log("Recaptcha initialized");
} catch (e) {
log("Recaptcha ERROR: " + e.message);
}
});

/* SEND OTP */
document.getElementById("signupBtn").addEventListener("click", async () => {
log("Send OTP clicked");

try {

const phone = document.getElementById("phone").value.trim();

log("Phone: " + phone);

if (!phone || phone.length !== 10) {
log("Invalid phone");
alert("Invalid phone");
return;
}

if (!window.recaptchaVerifier) {
log("Recaptcha missing");
alert("Recaptcha not ready");
return;
}

log("Sending OTP...");

confirmationResult = await signInWithPhoneNumber(
auth,
"+91" + phone,
window.recaptchaVerifier
);

log("OTP SENT SUCCESS");

document.getElementById("otp").style.display = "block";
document.getElementById("verifyOtpBtn").style.display = "block";

alert("OTP Sent");

} catch (error) {
log("OTP ERROR: " + error.code + " | " + error.message);
alert(error.message);
}
});

/* VERIFY OTP */
document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
log("Verify clicked");

try {

const code = document.getElementById("otp").value;

log("OTP: " + code);

if (!confirmationResult) {
log("No confirmationResult");
alert("Send OTP first");
return;
}

await confirmationResult.confirm(code);

log("OTP VERIFIED SUCCESS");
alert("Phone Verified");

} catch (error) {
log("VERIFY ERROR: " + error.code + " | " + error.message);
alert(error.message);
}
});