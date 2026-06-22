import {auth,db}
from "./firebase.js";

import {

createUserWithEmailAndPassword,
signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

setDoc,
doc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* Signup */

document.getElementById(
"signupBtn"
)

.onclick=async()=>{

try{

const email=
document.getElementById(
"email"
).value;

const password=
document.getElementById(
"password"
).value;

const userCredential=

await createUserWithEmailAndPassword(

auth,
email,
password

);

await setDoc(

doc(
db,
"Users",
userCredential.user.uid
),

{

name:
document.getElementById(
"name"
).value,

phone:
document.getElementById(
"phone"
).value,

email:email,

address:""

}

);

alert(
"Signup Successful"
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



/* Login */

document.getElementById(
"loginBtn"
)

.onclick=async()=>{

try{

const email=
document.getElementById(
"loginEmail"
).value;

const password=
document.getElementById(
"loginPassword"
).value;


await signInWithEmailAndPassword(

auth,
email,
password

);


/* Admin redirect */

if(

email.toLowerCase()

===

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
error.message
);

}

};