// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
RecaptchaVerifier,
signInWithPhoneNumber
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
getFirestore,
doc,
setDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAXtM0DnYPTYbdQmvv93KAQwcqxty2C1vQ",
  authDomain: "kodaihillsspot-4a1b8.firebaseapp.com",
  projectId: "kodaihillsspot-4a1b8",
  storageBucket: "kodaihillsspot-4a1b8.firebasestorage.app",
  messagingSenderId: "396566428046",
  appId: "1:396566428046:web:c9bafa2143b34e7d64ccdf",
  measurementId: "G-BZ8MBZEJQ4"
};

// Initialize
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// Signup
document.getElementById(
"signupBtn"
).addEventListener(
"click",
async()=>{

const name=
document.getElementById(
"name"
).value.trim();

const phone=
document.getElementById(
"phone"
).value.trim();

const email=
document.getElementById(
"email"
).value.trim();

const password=
document.getElementById(
"password"
).value.trim();


if(
!name ||
!phone ||
!email ||
!password
){

alert(
"Fill all fields"
);

return;

}


try{

const userCredential=
await createUserWithEmailAndPassword(
auth,
email,
password
);

const user=
userCredential.user;


// Store user data
await setDoc(
doc(
db,
"Users",
user.uid
),
{

name:name,
phone:phone,
email:email,
uid:user.uid,
createdAt:
new Date()

}
);

alert(
"Signup successful"
);

window.location.reload();

}

catch(error){

alert(
error.message
);

}

});



// Login
document.getElementById(
"loginBtn"
).addEventListener(
"click",
async()=>{

const email=
document.getElementById(
"loginEmail"
).value.trim();

const password=
document.getElementById(
"loginPassword"
).value.trim();


if(
!email ||
!password
){

alert(
"Enter email and password"
);

return;

}

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

const phone=
prompt(
"Enter registered phone with country code\nExample:+919876543210"
);


window.recaptchaVerifier=
new RecaptchaVerifier(
auth,
"recaptcha-container",
{
size:"normal"
}
);


const appVerifier=
window.recaptchaVerifier;


const confirmationResult=
await signInWithPhoneNumber(
auth,
phone,
appVerifier
);


window.confirmationResult=
confirmationResult;


// Show OTP box
document.getElementById(
"otp"
).style.display=
"block";

document.getElementById(
"verifyOtpBtn"
).style.display=
"block";

alert(
"OTP sent"
);

}

catch(error){

alert(
error.message
);

}

});




// Verify OTP
document.getElementById(
"verifyOtpBtn"
).addEventListener(
"click",
async()=>{

const otp=
document.getElementById(
"otp"
).value;


if(!otp){

alert(
"Enter OTP"
);

return;

}

try{

await window.confirmationResult.confirm(
otp
);

alert(
"Login successful"
);


// redirect
window.location.href=
"home.html";

}

catch(error){

alert(
"Invalid OTP"
);

}

});