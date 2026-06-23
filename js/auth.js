import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getAuth,
RecaptchaVerifier,
signInWithPhoneNumber,
createUserWithEmailAndPassword,
signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
getDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig={

apiKey:"YOUR_API_KEY",
authDomain:"kodaihillsspot-4a1b8.firebaseapp.com",
projectId:"kodaihillsspot-4a1b8",
storageBucket:"kodaihillsspot-4a1b8.firebasestorage.app",
messagingSenderId:"396566428046",
appId:"1:396566428046:web:c9bafa2143b34e7d64ccdf"

};

const app=initializeApp(firebaseConfig);

const auth=getAuth(app);

const db=getFirestore(app);

let currentUser;


/* RECAPTCHA */

window.recaptchaVerifier=
new RecaptchaVerifier(
auth,
"recaptcha-container",
{
size:"normal"
}
);

window.recaptchaVerifier.render();



/* PHONE OTP */

document.getElementById(
"sendOtpBtn"
).onclick=async()=>{

try{

const number=
document.getElementById(
"phone"
).value.trim();

const phone=
"+91"+number;

const result=
await signInWithPhoneNumber(
auth,
phone,
window.recaptchaVerifier
);

window.confirmationResult=
result;

document.getElementById(
"otpBox"
).classList.remove(
"hidden"
);

alert(
"OTP sent"
);

}

catch(error){

alert(
error.message
);

console.log(error);

}

};



/* VERIFY OTP */

document.getElementById(
"verifyBtn"
).onclick=async()=>{

const otp=
document.getElementById(
"otp"
).value;

try{

const result=
await window
.confirmationResult
.confirm(otp);

currentUser=
result.user;

const userDoc=
await getDoc(
doc(
db,
"Users",
currentUser.uid
)
);

if(userDoc.exists()){

window.location=
"home.html";

}

else{

document.getElementById(
"detailsBox"
).classList.remove(
"hidden"
);

}

}

catch{

alert(
"Wrong OTP"
);

}

};



/* SAVE NEW PHONE USER */

document.getElementById(
"saveBtn"
).onclick=async()=>{

const name=
document.getElementById(
"name"
).value;

const email=
document.getElementById(
"newEmail"
).value;

await setDoc(
doc(
db,
"Users",
currentUser.uid
),
{
uid:currentUser.uid,
name:name,
email:email,
phone:currentUser.phoneNumber
}
);

window.location=
"home.html";

};



/* EMAIL SIGNUP */

document.getElementById(
"signupBtn"
).onclick=async()=>{

try{

const email=
document.getElementById(
"email"
).value;

const password=
document.getElementById(
"password"
).value;

const result=
await createUserWithEmailAndPassword(
auth,
email,
password
);

await setDoc(
doc(
db,
"Users",
result.user.uid
),
{
uid:result.user.uid,
email:email
}
);

alert(
"Account created"
);

}
catch(error){

alert(
error.message
);

}

};



/* EMAIL LOGIN */

document.getElementById(
"loginBtn"
).onclick=async()=>{

try{

const email=
document.getElementById(
"email"
).value;

const password=
document.getElementById(
"password"
).value;

await signInWithEmailAndPassword(
auth,
email,
password
);

window.location=
"home.html";

}
catch(error){

alert(
error.message
);

}

};