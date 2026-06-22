import {auth,db}
from "./firebase.js";

import {

onAuthStateChanged,
signOut

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {

doc,
getDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


onAuthStateChanged(

auth,

async(user)=>{

if(user){

const docRef=

doc(
db,
"users",
user.uid
);

const docSnap=

await getDoc(
docRef
);

if(docSnap.exists()){

const data=
docSnap.data();

document.getElementById(
"name"
).innerText=
data.name;

document.getElementById(
"email"
).innerText=
data.email;

document.getElementById(
"phone"
).innerText=
data.phone;

document.getElementById(
"address"
).innerText=
data.address;

}

}
else{

window.location=
"login.html";

}

}


);


document.getElementById(
"logoutBtn"
)

.onclick=()=>{

signOut(auth);

window.location=
"login.html";

};