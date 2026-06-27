import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
collection,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let currentUser=null;
let checkoutItems=[];
let totalAmount=0;


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



/* Login Check */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"login.html";

return;

}

currentUser=user;

loadCheckout();

}

);



/* Load Checkout Items */
function loadCheckout(){

checkoutItems =
JSON.parse(
localStorage.getItem(
"checkoutItems"
)
) || [];

const orderItems =
document.getElementById(
"orderItems"
);

if(checkoutItems.length===0){

orderItems.innerHTML=`

<div style="
text-align:center;
padding:30px;
">

<h2>
🛒 Cart Empty
</h2>

</div>

`;

document.getElementById(
"subtotal"
).innerText="₹0";

document.getElementById(
"total"
).innerText="₹0";

return;

}

let html="";
totalAmount=0;

checkoutItems.forEach(item=>{

const qty=
Number(
item.quantity || 1
);

const unitPrice=
Number(
item.unitPrice ||
item.price ||
0
);

const itemTotal=
Number(
item.totalPrice ||
(unitPrice*qty)
);

totalAmount += itemTotal;

html += `

<div class="product"
style="
margin-bottom:20px;
padding:15px;
background:#fafafa;
border-radius:15px;
">

<img
src="${item.image || 'logo.png'}"
onerror="this.src='logo.png'"
>

<div class="details">

<h3>
${item.name || "No Product"}
</h3>

<div class="price">
₹${itemTotal}
</div>

<p>
Unit Price : ₹${unitPrice}
</p>

<p>
Qty : ${qty}
</p>

<p>
Pack : ${item.pack || "-"}
</p>

</div>

</div>

`;

});

orderItems.innerHTML=html;

document.getElementById(
"subtotal"
).innerText=
`₹${totalAmount}`;

document.getElementById(
"total"
).innerText=
`₹${totalAmount}`;

}

document.getElementById(
"orderItems"
).innerHTML=html;




/* Place Order */

document.getElementById(

"placeOrder"

)

.onclick=()=>{


const name=

document.getElementById(
"name"
)

.value.trim();


const phone=

document.getElementById(
"phone"
)

.value.trim();


const state=

document.getElementById(
"state"
)

.value;


const district=

document.getElementById(
"district"
)

.value;


const area=

document.getElementById(
"area"
)

.value.trim();


const street=

document.getElementById(
"street"
)

.value.trim();


const pincode=

document.getElementById(
"pincode"
)

.value.trim();



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



/* Razorpay */

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
"Order Payment",

image:
"logo.png",


handler:

async(response)=>{


for(

let item of checkoutItems

){

const qty=

Number(
item.quantity||1
);

const unitPrice=

Number(
item.unitPrice||
item.price||
0
);

const itemTotal=

Number(
item.totalPrice||

(unitPrice*qty)

);


await addDoc(

collection(
db,
"Orders"
),

{

uid:
currentUser.uid,

productId:
item.productId ||

"",

name:
item.name ||

"",

image:
item.image ||

"logo.png",

quantity:
qty,

pack:

item.pack ||

item.selectedSize ||

"-",

unitPrice:
unitPrice,

totalPrice:
itemTotal,

customerName:
name,

phone:
phone,

address:
`${area},
${street},
${district},
${state}
-
${pincode}`,

paymentId:
response
.razorpay_payment_id,

status:
"Pending",

createdAt:
Date.now()

}

);

}


localStorage.removeItem(
"checkoutItems"
);


showPopup(

"Success",

"Order placed successfully"

);


setTimeout(()=>{

window.location=
"orders.html";

},1500);

},


prefill:{

name:name,

contact:phone,

email:
currentUser.email

}

};


const razorpay=

new Razorpay(
options
);


razorpay.on(

"payment.failed",

()=>{

showPopup(

"Payment Failed",

"Please try again"

);

}

);


razorpay.open();

};