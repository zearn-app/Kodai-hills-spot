import { auth, db }
from "./firebase.js";

import {

createUserWithEmailAndPassword,
signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {

doc,
setDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const signupBtn=
document.getElementById(
"signupBtn"
);

const loginBtn=
document.getElementById(
"loginBtn"
);


/* Signup */

signupBtn.onclick=

async()=>{

try{

const name=

document.getElementById(
"name"
)

.value.trim();


const email=

document.getElementById(
"email"
)

.value.trim();


const password=

document.getElementById(
"password"
)

.value.trim();



if(

!name||
!email||
!password

){

showPopup(

"Fields Empty",

"Please fill all fields"

);

return;

}



signupBtn.innerText=
"Creating...";

signupBtn.disabled=
true;



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

uid:
user.uid,

name:
name,

email:
email

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
)

.value.trim();



const password=

document.getElementById(
"loginPassword"
)

.value.trim();



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