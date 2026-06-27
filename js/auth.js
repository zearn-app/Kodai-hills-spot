import { auth, db }
from "./firebase.js";

import {

createUserWithEmailAndPassword,
signInWithEmailAndPassword,
sendPasswordResetEmail

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
setDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const signupBtn =
document.getElementById(
"signupBtn"
);

const loginBtn =
document.getElementById(
"loginBtn"
);

const forgotBtn =
document.getElementById(
"forgotPassword"
);


/* Signup */

signupBtn.onclick = async()=>{

try{

const name =
document.getElementById(
"name"
).value.trim();

const email =
document.getElementById(
"email"
).value.trim();

const password =
document.getElementById(
"password"
).value.trim();


if(
!name ||
!email ||
!password
){

showPopup(
"Fields Empty",
"Please fill all fields"
);

return;

}


signupBtn.innerText =
"Creating...";

signupBtn.disabled=true;


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
email:email

}

);


showPopup(

"Success",
"Signup successful"

);


setTimeout(()=>{

window.location=
"index.html";

},1500);

}

catch(error){

showPopup(

"Signup Failed",
error.message

);

}

finally{

signupBtn.innerText=
"Sign Up";

signupBtn.disabled=
false;

}

};



/* Login */

loginBtn.onclick=

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

showPopup(

"Fields Empty",
"Please enter email and password"

);

return;

}


loginBtn.innerText=
"Logging...";

loginBtn.disabled=
true;


await signInWithEmailAndPassword(

auth,
email,
password

);


const adminEmail=
"kodaihillsspot@gmail.com";


if(
email===adminEmail
){

showPopup(

"Admin Login",
"Admin login successful"

);

setTimeout(()=>{

window.location=
"admin.html";

},1500);

}

else{

showPopup(

"Login Success",
"Welcome back"

);

setTimeout(()=>{

window.location=
"index.html";

},1500);

}

}

catch(error){

showPopup(

"Login Failed",
error.message

);

}

finally{

loginBtn.innerText=
"Login";

loginBtn.disabled=
false;

}

};



/* Forgot Password */

/* Open popup */

forgotBtn.onclick=()=>{

const loginEmail=

document.getElementById(
"loginEmail"
).value.trim();

document.getElementById(
"resetEmail"
).value=loginEmail;

document.getElementById(
"resetPopup"
).style.display=
"flex";

};


/* Close popup */

window.closeResetPopup=()=>{

document.getElementById(
"resetPopup"
).style.display=
"none";

};


/* Send reset link */

document.getElementById(
"sendResetBtn"
).onclick=

async()=>{

try{

const email=

document.getElementById(
"resetEmail"
).value.trim();


if(!email){

showPopup(

"Email Required",
"Please enter Gmail"

);

return;

}


document.getElementById(
"sendResetBtn"
).innerText=
"Sending...";


await sendPasswordResetEmail(

auth,
email

);


closeResetPopup();


showPopup(

"Reset Link Sent ✅",

"Password reset link sent to your Gmail.\n\nPlease check Inbox and Spam folder."

);

}

catch(error){

showPopup(

"Reset Failed",

error.message

);

}

finally{

document.getElementById(
"sendResetBtn"
).innerText=
"Send Link";

}

};