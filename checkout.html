import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
collection,
query,
where,
getDocs,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let currentUser=null;
let totalAmount=0;
let currentProduct=null;


/* Popup */

function showPopup(title,message){

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



/* Auth */

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location=
"login.html";

return;

}

currentUser=user;

loadProduct();

}

);



/* Load product from Cart */

async function loadProduct(){

try{

const q=query(

collection(db,"Cart"),

where(
"uid",
"==",
currentUser.uid
)

);

const snapshot=
await getDocs(q);

if(snapshot.empty){

document.getElementById(
"productName"
).innerText=
"Cart Empty";

return;

}

const item=
snapshot.docs[0].data();

currentProduct=item;

const qty=
Number(
item.quantity||1
);

const price=
Number(
item.price||0
);

totalAmount=
price*qty;


document.getElementById(
"productName"
).innerText=
item.name || "No Product";

document.getElementById(
"productPrice"
).innerText=
`₹${price}`;

document.getElementById(
"productImage"
).src=
item.image || "logo.png";

document.getElementById(
"productQty"
).innerText=
`Qty : ${qty} ${item.selectedSize ? "(" + item.selectedSize + ")" : ""}`;

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

showPopup(
"Error",
"Unable to load product"
);

}

}



/* Place Order */

document.getElementById(
"placeOrder"
)

.onclick=()=>{

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
"Missing Information",
"Please fill all fields"
);

return;

}


const options={

key:"rzp_test_T5tWAjBQVPNBI4",

amount:
totalAmount*100,

currency:"INR",

name:"Kodai Hills Spot",

description:
currentProduct.name,

image:"logo.png",

handler:async function(response){

await addDoc(

collection(
db,
"Orders"
),

{

uid:
currentUser.uid,

name:
currentProduct.name,

price:
totalAmount,

quantity:
currentProduct.quantity,

pack:
currentProduct.selectedSize,

customerName:
name,

phone:
phone,

address:
`${area}, ${street}, ${district}, ${state}-${pincode}`,

paymentId:
response.razorpay_payment_id,

status:
"Pending",

createdAt:
Date.now()

}

);

showPopup(
"Success",
"Order placed successfully"
);

},

prefill:{

name:name,

contact:phone,

email:
currentUser.email

}

};


new Razorpay(
options
).open();

};