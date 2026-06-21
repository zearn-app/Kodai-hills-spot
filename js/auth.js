import { auth,db } from "./firebase.js";

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



signupBtn.onclick=async()=>{

try{

const user=

await createUserWithEmailAndPassword(

auth,

name.value,

password.value

);


await setDoc(

doc(
db,
"users",
user.user.uid
),

{

name:name.value,
phone:phone.value,
address:address.value,
email:email.value

}

);

alert("Signup Success");

window.location="index.html";

}

catch(error){

alert(error.message);

}

};


loginBtn.onclick=async()=>{

try{

await signInWithEmailAndPassword(

auth,

loginEmail.value,
loginPassword.value

);

alert("Login Success");

window.location="index.html";

}

catch(error){

alert(error.message);

}

};