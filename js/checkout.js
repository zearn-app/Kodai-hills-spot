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


/* Auth */

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


/* Product Load */

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
"No Product";

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

document.getElementById(
"productName"
).innerText=
product.name;

document.getElementById(
"productPrice"
).innerText=
`₹${product.price}`;

document.getElementById(
"productImage"
).src=
product.Image;

document.getElementById(
"productQty"
).innerText=
"Qty : 1";

document.getElementById(
"subtotal"
).innerText=
`₹${product.price}`;

document.getElementById(
"total"
).innerText=
`₹${product.price}`;

}

catch(error){

console.log(error);

}

}


/* Place Order */

document.getElementById(
"placeOrder"
)

.addEventListener(

"click",

()=>{

const name=
document.getElementById(
"name"
).value;

const phone=
document.getElementById(
"phone"
).value;

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
).value;

const street=
document.getElementById(
"street"
).value;

const pincode=
document.getElementById(
"pincode"
).value;

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

alert(
"Order placed successfully"

);

}

);


/* State + District */

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
`<option>Select District</option>`;

const districts=
statesAndDistricts[
stateSelect.value
]||[];

districts.forEach(

district=>{

districtSelect.innerHTML+=
`<option>${district}</option>`;

}

);

}

);