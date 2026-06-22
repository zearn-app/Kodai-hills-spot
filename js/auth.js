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

const signupBtn =
document.getElementById("signupBtn");

const loginBtn =
document.getElementById("loginBtn");



signupBtn.onclick = async()=>{

try{

const name =
document.getElementById("name").value.trim();

const phone =
document.getElementById("phone").value.trim();

const address =
document.getElementById("address").value.trim();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();


// Validation

if(
name==="" ||
phone==="" ||
address==="" ||
email==="" ||
password===""

){

alert("Please fill all fields");
return;

}


const userCredential =

await createUserWithEmailAndPassword(

auth,
email,
password

);


// Save user details to Firestore

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
email:email,
uid:userCredential.user.uid

}

);

alert("Signup Successful");

window.location="index.html";

}

catch(error){

alert(error.message);

}

};




loginBtn.onclick = async()=>{

try{

const email =
document.getElementById("loginEmail").value.trim();

const password =
document.getElementById("loginPassword").value.trim();


// Validation

if(
email==="" ||
password===""
){

alert("Please fill all fields");
return;

}


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