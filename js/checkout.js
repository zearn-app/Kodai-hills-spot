import { auth } from "./firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


let currentUser=null;


/* Auth Check */

onAuthStateChanged(

auth,

(user)=>{

currentUser=user;

if(!user){

window.location=
"login.html";

return;

}

loadProduct();

}

);


/* Load Product */

function loadProduct(){

const params=
new URLSearchParams(
window.location.search
);

const name=
params.get("name")||"Product";

const price=
params.get("price")||0;

const image=
params.get("image")||"";

const qty=
params.get("qty")||1;

document.getElementById(
"productName"
).innerText=name;

document.getElementById(
"productPrice"
).innerText=`₹${price}`;

document.getElementById(
"productImage"
).src=image;

document.getElementById(
"productQty"
).innerText=`Qty : ${qty}`;

document.getElementById(
"subtotal"
).innerText=`₹${price}`;

document.getElementById(
"total"
).innerText=`₹${price}`;

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
"Tirunelveli",
"Salem",
"Trichy"
],

"Kerala":[
"Kochi",
"Kollam",
"Kozhikode"
],

"Karnataka":[
"Bangalore",
"Mysore",
"Mangalore"
]

};


Object.keys(
statesAndDistricts
)

.forEach(state=>{

stateSelect.innerHTML+=`

<option>

${state}

</option>

`;

});


stateSelect.addEventListener(

"change",

()=>{

districtSelect.innerHTML=`

<option>

Select District

</option>

`;

const districts=

statesAndDistricts[
stateSelect.value
];

districts.forEach(

district=>{

districtSelect.innerHTML+=`

<option>

${district}

</option>

`;

}

);

}

);