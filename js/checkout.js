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


/* PRODUCT LOAD */

async function loadProduct(){

try{

const params=
new URLSearchParams(
window.location.search
);

const productId=
params.get("id");

console.log(
"Product ID:",
productId
);

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

console.log(product);

currentProduct=
product;

totalAmount=
Number(
product.price || 0
);


document.getElementById(
"productName"
).innerText=
product.name || "No Name";


document.getElementById(
"productPrice"
).innerText=
`₹${totalAmount}`;


document.getElementById(
"productImage"
).src=
product.Image || "logo.png";


document.getElementById(
"productQty"
).innerText=
"Qty : 1";


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

console.log(
"Load Error:",
error
);

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

alert(
"Please fill all fields"
);

return;

}


if(!currentProduct){

alert(
"Product not loaded"
);

return;

}


/* RAZORPAY */

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

alert(

"✅ Payment Success\n\nPayment ID:\n"+

response.razorpay_payment_id

);

},

prefill:{

name:name,

contact:phone,

email:
currentUser?.email || ""

},

theme:{

color:"#2e7d32"

},

modal:{

ondismiss:function(){

alert(
"❌ Payment cancelled.\nTry again."
);

}

}

};


const razorpay=
new Razorpay(
options
);


/* PAYMENT FAILED */

razorpay.on(

"payment.failed",

function(response){

alert(

"❌ Payment Failed\n\n"+

response.error.description

);

}

);

razorpay.open();

}

);


/* STATE + DISTRICT */

const stateSelect=
document.getElementById(
"state"
);

const districtSelect=
document.getElementById(
"district"
);


const statesAndDistricts={

"Tamil Nadu":[
"Chennai",
"Coimbatore",
"Madurai",
"Trichy"
],

"Kerala":[
"Kochi",
"Kollam"
],

"Karnataka":[
"Bangalore",
"Mysore"
]

};


Object.keys(
statesAndDistricts
)

.forEach(state=>{

stateSelect.innerHTML+=

`<option>${state}</option>`;

});


stateSelect.addEventListener(

"change",

()=>{

districtSelect.innerHTML=

"<option>Select District</option>";

const districts=

statesAndDistricts[
stateSelect.value
] || [];


districts.forEach(

district=>{

districtSelect.innerHTML+=

`<option>${district}</option>`;

}

);

}

);