import { auth, db } from "./firebase.js";

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
document.getElementById("signupBtn");

const loginBtn=
document.getElementById("loginBtn");



signupBtn.onclick=async()=>{

try{

const email=
document.getElementById("email").value;

const password=
document.getElementById("password").value;

const name=
document.getElementById("name").value;

const phone=
document.getElementById("phone").value;

const address=
document.getElementById("address").value;


const userCredential=

await createUserWithEmailAndPassword(

auth,
email,
password

);


await setDoc(

doc(
db,
"users",
userCredential.user.uid
),

{

name:name,
phone:phone,
address:address,
email:email

}

);

alert("Signup Successful");

window.location="index.html";

}

catch(error){

alert(error.message);

}

};



loginBtn.onclick=async()=>{

try{

const email=
document.getElementById("loginEmail").value;

const password=
document.getElementById("loginPassword").value;


await signInWithEmailAndPassword(

auth,
email,
password

);

alert("Login Successful");

window.location="index.html";

}

catch(error){

alert(error.message);

}

};