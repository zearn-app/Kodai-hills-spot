import {auth,db}
from "./firebase.js";

import {

RecaptchaVerifier,
signInWithPhoneNumber,
createUserWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
setDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let confirmationResult;


/* Recaptcha */

window.recaptchaVerifier=

new RecaptchaVerifier(

auth,
"recaptcha-container",
{

size:"invisible"

}

);


/* Send OTP */

signupBtn.onclick=

async()=>{

try{

const phone=

document.getElementById(
"phone"
).value.trim();


if(phone.length!=10){

alert(
"Enter valid phone number"
);

return;

}


const appVerifier=

window.recaptchaVerifier;


confirmationResult=

await signInWithPhoneNumber(

auth,

"+91"+phone,

appVerifier

);


alert(
"OTP sent successfully"
);


otp.style.display=
"block";

verifyOtpBtn.style.display=
"block";

signupBtn.style.display=
"none";

}

catch(error){

alert(
error.message
);

}

};



/* Verify OTP */

verifyOtpBtn.onclick=

async()=>{

try{

const code=

otp.value;


await confirmationResult.confirm(
code
);


const user=

auth.currentUser;


const name=
document.getElementById(
"name"
).value;

const email=
document.getElementById(
"email"
).value;

const password=
document.getElementById(
"password"
).value;

const phone=
document.getElementById(
"phone"
).value;


/* Create email account */

await createUserWithEmailAndPassword(

auth,
email,
password

);


/* Save user */

await setDoc(

doc(
db,
"Users",
user.uid
),

{

name:name,
email:email,
phone:phone

}

);


alert(
"Signup successful"
);


window.location=
"index.html";

}

catch(error){

alert(
error.message
);

}

};