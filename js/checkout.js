import { db, auth } from "./firebase.js";

import {
doc,
getDoc,
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

const productId=
params.get("id");

const qty=
parseInt(
params.get("qty")
)||1;

let currentUser=null;
let currentProduct=null;


/* Auth check */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"login.html";

return;

}

currentUser=user;

loadProduct();

});


async function loadProduct(){

try{

const snapshot=

await getDoc(

doc(
db,
"Products",
productId
)

);


if(!snapshot.exists()){

document.body.innerHTML=
"<h2>Product not found</h2>";

return;

}


currentProduct=
snapshot.data();


document.getElementById(
"productImage"
).src=
currentProduct.Image;


document.getElementById(
"productName"
).innerText=
currentProduct.name;


document.getElementById(
"productPrice"
).innerText=
"₹"+currentProduct.price;


document.getElementById(
"productQty"
).innerText=
"Qty : "+qty;


const subtotal=

Number(
currentProduct.price
)*qty;

const delivery=40;

const total=
subtotal+delivery;


document.getElementById(
"subtotal"
).innerText=
"₹"+subtotal;


document.getElementById(
"total"
).innerText=
"₹"+total;

}

catch(error){

console.log(error);

}

}



/* Place order */

document.getElementById(
"placeOrder"
)

.onclick=

async()=>{

const name=
document.getElementById(
"name"
).value;

const phone=
document.getElementById(
"phone"
).value;

const address=
document.getElementById(
"address"
).value;

const payment=
document.getElementById(
"payment"
).value;


if(

name=="" ||

phone=="" ||

address==""

){

alert(
"Fill all details"
);

return;

}


const subtotal=

Number(
currentProduct.price
)*qty;

const total=
subtotal+40;


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
currentProduct.name,

price:
currentProduct.price,

image:
currentProduct.Image,

quantity:
qty,

customerName:
name,

phone:
phone,

address:
address,

payment:
payment,

total:
total,

status:
"Pending",

orderDate:
new Date()
.toISOString()

}

);

alert(
"Order placed successfully"
);

window.location=
"orders.html";

}

catch(error){

alert(
error.message
);

}

};