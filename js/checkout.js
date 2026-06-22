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


const params=
new URLSearchParams(
window.location.search
);

const id=params.get("id");
const qty=params.get("qty");


document.getElementById(
"placeOrder"
)

.onclick=

()=>{

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location=
"login.html";

return;

}


await addDoc(

collection(
db,
"Orders"
),

{

uid:user.uid,

email:user.email,

productId:id,

quantity:qty,

address:
document.getElementById(
"address"
).value,

paymentMethod:
document.getElementById(
"payment"
).value,

status:"Pending",

orderDate:
new Date()

}

);


alert(
"Order placed"
);

window.location=
"profile.html";

});

};