import { auth, db }
from "./firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let currentUser=null;
let totalAmount=0;
let currentProduct=null;


/* POPUP */

function showPopup(
title,
message
){

document.getElementById(
"popupTitle"
).innerText=title;

document.getElementById(
"popupMessage"
).innerText=message;

document.getElementById(
"popupBox"
).style.display="flex";

}

window.closePopup=()=>{

document.getElementById(
"popupBox"
).style.display="none";

};



/* AUTH */

onAuthStateChanged(

auth,

(user)=>{

currentUser=user;

if(!user){

window.location="login.html";

return;

}

loadProduct();

}

);



async function loadProduct(){

try{

const params=
new URLSearchParams(
window.location.search
);

const productId=
params.get("id");

if(!productId){

document.getElementById(
"productName"
).innerText=
"No Product Selected";

return;

}

const productRef=
doc(
db,
"Products",
productId
);

const productSnap=
await getDoc(
productRef
);

if(!productSnap.exists()){

document.getElementById(
"productName"
).innerText=
"Product Not Found";

return;

}

const product=
productSnap.data();

currentProduct=
product;

totalAmount=
Number(
product.price||0
);


document.getElementById(
"productName"
).innerText=
product.name;

document.getElementById(
"productPrice"
).innerText=
`₹${totalAmount}`;

document.getElementById(
"productImage"
).src=
product.Image||"logo.png";

document.getElementById(
"subtotal"
).innerText=
`₹${totalAmount}`;

document.getElementById(
"total"
).innerText=
`₹${totalAmount}`;

}

catch(error){

console.log(error);

}

}


/* PLACE ORDER */

document
.getElementById(
"placeOrder"
)

.addEventListener(

"click",

()=>{

const name=
document.getElementById(
"name"
).value.trim();

const phone=
document.getElementById(
"phone"
).value.trim();

const state=
document.getElementById(
"state"
).value;

const district=
document.getElementById(
"district"
).value;

const area=
document.getElementById(
"area"
).value.trim();

const street=
document.getElementById(
"street"
).value.trim();

const pincode=
document.getElementById(
"pincode"
).value.trim();


if(
!name||
!phone||
!state||
!district||
!area||
!street||
!pincode
){

showPopup(
"Missing Fields",
"Please fill all fields"
);

return;

}


const options={

key:
"rzp_test_T5tWAjBQVPNBI4",

amount:
totalAmount*100,

currency:
"INR",

name:
"Kodai Hills Spot",

description:
currentProduct.name,

image:
"logo.png",

handler:function(response){

showPopup(

"Payment Success",

"Payment ID:\n"+

response.razorpay_payment_id

);

},

prefill:{

name:name,

contact:phone,

email:
currentUser?.email||""

},

theme:{
color:"#2e7d32"
},

modal:{

ondismiss:function(){

showPopup(

"Payment Cancelled",

"Please try again"

);

}

}

};


const razorpay=
new Razorpay(
options
);


razorpay.on(

"payment.failed",

function(){

showPopup(

"Payment Failed",

"Please try again"

);

}

);


razorpay.open();

}

);