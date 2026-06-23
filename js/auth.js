import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getAuth,
RecaptchaVerifier,
signInWithPhoneNumber
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

apiKey:"AIzaSyAXtM0DnYPTYbdQmvv93KAQwcqxty2C1vQ",
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


/* IMPORTANT FIX */

window.recaptchaVerifier=
new RecaptchaVerifier(

auth,

"recaptcha-container",

{
size:"normal"
}

);

await window.recaptchaVerifier.render();



/* SEND OTP */

document
.getElementById("sendOtpBtn")

.onclick=

async()=>{

try{

const phoneInput=
document
.getElementById("phone")
.value
.trim();

if(phoneInput.length!==10){

alert(
"Enter valid phone number"
);

return;

}

const phone=
"+91"+phoneInput;


const confirmationResult=

await signInWithPhoneNumber(

auth,
phone,
window.recaptchaVerifier

);


window.confirmationResult=
confirmationResult;


document
.getElementById(
"otpBox"
)
.classList.remove(
"hidden"
);


alert(
"OTP sent successfully"
);

}

catch(error){

console.log(error);

alert(
error.message
);

}

};



/* VERIFY OTP */

document
.getElementById(
"verifyBtn"
)

.onclick=

async()=>{

try{

const otp=

document
.getElementById(
"otp"
)
.value
.trim();

if(!otp){

alert(
"Enter OTP"
);

return;

}


const result=

await window
.confirmationResult
.confirm(
otp
);

currentUser=
result.user;


/* Check existing user */

const snapshot=

await getDoc(

doc(
db,
"Users",
currentUser.uid
)

);


if(snapshot.exists()){

window.location=
"home.html";

}

else{

document
.getElementById(
"detailsBox"
)
.classList.remove(
"hidden"
);

}

}

catch(error){

console.log(error);

alert(
"Wrong OTP"
);

}

};



/* SAVE USER */

document
.getElementById(
"saveBtn"
)

.onclick=

async()=>{

const name=

document
.getElementById(
"name"
)
.value
.trim();

const email=

document
.getElementById(
"email"
)
.value
.trim();


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