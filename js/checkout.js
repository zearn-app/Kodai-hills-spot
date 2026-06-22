import {db,auth}
from "./firebase.js";

import {

collection,
addDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


let currentUser=null;

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"login.html";

return;

}

currentUser=user;

});


document.getElementById(
"placeOrder"
)

.onclick=

async()=>{

try{

await addDoc(

collection(
db,
"Orders"
),

{

uid:
currentUser.uid,

name:
document.getElementById(
"name"
).value,

phone:
document.getElementById(
"phone"
).value,

address:
document.getElementById(
"address"
).value,

payment:
document.getElementById(
"payment"
).value,

status:
"Pending",

date:
new Date().toLocaleString()

}

);

alert(
"Order placed"
);

window.location=
"profile.html";

}

catch(error){

alert(
error.message
);

}

};