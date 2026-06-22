import { auth, db } from "./firebase.js";

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


const nameEl=document.getElementById("name");
const emailEl=document.getElementById("email");
const phoneEl=document.getElementById("phone");
const addressEl=document.getElementById("address");


onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location="login.html";
return;

}

try{

const userRef=
doc(
db,
"users",
user.uid
);

const userSnap=
await getDoc(userRef);


if(userSnap.exists()){

const data=
userSnap.data();

nameEl.innerText=
data.name || "No Name";

emailEl.innerText=
data.email || user.email;

phoneEl.innerText=
data.phone || "No Phone";

addressEl.innerText=
data.address || "No Address";

}
else{

nameEl.innerText=
"User data not found";

emailEl.innerText=
user.email;

phoneEl.innerText=
"-";

addressEl.innerText=
"-";

console.log(
"No Firestore document"
);

}

}

catch(error){

console.log(error);

nameEl.innerText=
"Error loading profile";

}

});


document.getElementById(
"logoutBtn"
)

.addEventListener(
"click",
async()=>{

await signOut(auth);

window.location=
"login.html";

});