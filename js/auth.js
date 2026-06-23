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

const app=
initializeApp(firebaseConfig);

const auth=
getAuth(app);

const db=
getFirestore(app);

let currentUser;


/* IMPORTANT */

window.recaptchaVerifier=
new RecaptchaVerifier(

auth,
"recaptcha-container",
{
size:"normal"
}

);

window.recaptchaVerifier
.render();


document
.getElementById(
"sendOtpBtn"
)

.onclick=

async()=>{

try{

let number=

document
.getElementById(
"phone"
)
.value
.trim();

if(number.length!=10){

alert(
"Enter valid number"
);

return;

}

const phone=
"+91"+number;


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
"OTP sent"
);

}

catch(error){

console.log(error);

alert(error.message);

}

};



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
.value;


const result=

await window
.confirmationResult
.confirm(
otp
);

currentUser=
result.user;


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

alert(
"Wrong OTP"
);

}

};



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
.value;

const email=

document
.getElementById(
"email"
)
.value;


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