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



// FIREBASE CONFIG

const firebaseConfig={

apiKey:"AIzaSyAXtM0DnYPTYbdQmvv93KAQwcqxty2C1vQ",

authDomain:"kodaihillsspot-4a1b8.firebaseapp.com",

projectId:"kodaihillsspot-4a1b8",

storageBucket:"kodaihillsspot-4a1b8.firebasestorage.app",

messagingSenderId:"396566428046",

appId:"1:396566428046:web:c9bafa2143b34e7d64ccdf"

};


// Initialize Firebase

const app=initializeApp(firebaseConfig);

const auth=getAuth(app);

const db=getFirestore(app);


// Recaptcha

window.onload=()=>{

window.recaptchaVerifier=

new RecaptchaVerifier(

auth,

"recaptcha-container",

{

size:"normal"

}

);

};



// SIGNUP

document.getElementById(
"signupBtn"
)

.onclick=

async()=>{

try{

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

uid:user.uid,

name:name,

phone:"+91"+phone,

email:email

}

);


alert(
"Signup successful"
);

location.reload();

}

catch(error){

alert(
error.message
);

}

};




// LOGIN + SEND OTP


document.getElementById(
"loginBtn"
)

.onclick=

async()=>{


try{

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
"Enter email and password"
);

return;

}


await signInWithEmailAndPassword(

auth,
email,
password

);



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


let phone="";


snapshot.forEach(item=>{

phone=
item.data().phone;

});


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


// SHOW OTP

document.getElementById(
"otp"
).style.display=
"block";


document.getElementById(
"verifyOtpBtn"
).style.display=
"block";


alert(
"OTP Sent"
);

}

catch(error){

console.log(error);

alert(
error.message
);

}

};




// VERIFY OTP

document.getElementById(
"verifyOtpBtn"
)

.onclick=

async()=>{


try{

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


await window.confirmationResult.confirm(
otp
);


alert(
"Login Success"
);


// Admin redirect

if(

auth.currentUser.email===

"kodaihillsspot@gmail.com"

){

window.location=
"admin.html";

}

else{

window.location=
"index.html";

}


}

catch(error){

alert(
"Invalid OTP"
);

}

};