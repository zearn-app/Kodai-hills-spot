import { auth } from "./firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber } 
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

let confirmationResult;

/* INIT CAPTCHA (IMPORTANT FIX) */
window.onload = () => {
window.recaptchaVerifier = new RecaptchaVerifier(
auth,
"recaptcha-container",
{
size: "invisible"
}
);

window.recaptchaVerifier.render();
};

/* SEND OTP */
document.getElementById("signupBtn").onclick = async () => {
try {

const phone = document.getElementById("phone").value.trim();

if (!phone || phone.length !== 10) {
alert("Enter valid phone number");
return;
}

const appVerifier = window.recaptchaVerifier;

if (!appVerifier) {
alert("Captcha not ready. Reload page.");
return;
}

confirmationResult = await signInWithPhoneNumber(
auth,
"+91" + phone,
appVerifier
);

document.getElementById("otp").style.display = "block";
document.getElementById("verifyOtpBtn").style.display = "block";

alert("OTP sent");

} catch (err) {
console.log(err);
alert("OTP Error: " + err.message);
}
};