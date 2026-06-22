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
setDoc,
collection,
query,
where,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// Firebase Config
const firebaseConfig = {

apiKey:"AIzaSyAXtM0DnYPTYbdQmvv93KAQwcqxty2C1vQ",
authDomain:"kodaihillsspot-4a1b8.firebaseapp.com",
projectId:"kodaihillsspot-4a1b8",
storageBucket:"kodaihillsspot-4a1b8.firebasestorage.app",
messagingSenderId:"396566428046",
appId:"1:396566428046:web:c9bafa2143b34e7d64ccdf"

};


// Initialize
const app=initializeApp(firebaseConfig);

const auth=getAuth(app);

const db=getFirestore(app);



// Create Recaptcha
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



// SIGNUP
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
!name||
!phone||
!email||
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


await setDoc(
doc(
db,
"Users",
user.uid
),
{

name:name,
phone:"+91"+phone,
email:email,
uid:user.uid

}
);


alert(
"Signup Successful"
);

window.location.reload();

}

catch(error){

alert(
error.message
);

}

});




// LOGIN
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
!email||
!password
){

alert(
"Enter email/password"
);

return;

}


try{

await signInWithEmailAndPassword(
auth,
email,
password
);


// Get phone from Firestore
const q=
query(
collection(
db,
"Users"
),
where(
"email",
"==",
email
)
);


const snapshot=
await getDocs(q);


if(
snapshot.empty
){

alert(
"User not found"
);

return;

}


let phone="";


snapshot.forEach(doc=>{

phone=
doc.data().phone;

});



// Send OTP
const confirmationResult=
await signInWithPhoneNumber(
auth,
phone,
appVerifier
);


window.confirmationResult=
confirmationResult;


// Show OTP section
document.getElementById(
"otp"
).style.display=
"block";

document.getElementById(
"verifyOtpBtn"
).style.display=
"block";


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

});




// VERIFY OTP
document.getElementById(
"verifyOtpBtn"
).addEventListener(
"click",
async()=>{


const otp=
document.getElementById(
"otp"
).value.trim();


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
"Login Successful"
);


window.location.href=
"home.html";


}

catch(error){

alert(
"Invalid OTP"
);

}


});