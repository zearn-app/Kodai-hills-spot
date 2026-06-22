import { db, auth } from "./firebase.js";

import{
doc,
getDoc,
setDoc,
collection,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import{
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const params=new URLSearchParams(
window.location.search
);

const productId=params.get("id");

const qty=parseInt(
params.get("qty")
)||1;

let currentUser=null;
let currentProduct=null;
let savedAddress=null;


onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location="login.html";

return;

}

currentUser=user;

await loadSavedAddress();

loadProduct();

});


async function loadSavedAddress(){

const snapshot=
await getDoc(

doc(
db,
"Users",
currentUser.uid
)

);

if(snapshot.exists()){

const data=
snapshot.data();

if(data.address){

savedAddress=
data.address;

document.getElementById(
"savedAddress"
).classList.remove(
"hidden"
);

document.getElementById(
"addressForm"
).classList.add(
"hidden"
);

document.getElementById(
"addressText"
).innerHTML=`

<b>${savedAddress.name}</b><br>

${savedAddress.phone}<br>

${savedAddress.area},
${savedAddress.street}<br>

${savedAddress.district},
${savedAddress.state}
-${savedAddress.pincode}

`;

}

}

}


async function loadProduct(){

const snapshot=
await getDoc(
doc(
db,
"Products",
productId
)
);

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
"₹"+
currentProduct.price;

document.getElementById(
"productQty"
).innerText=
"Qty : "+qty;

const subtotal=
Number(
currentProduct.price
)*qty;

const total=
subtotal+40;

document.getElementById(
"subtotal"
).innerText=
"₹"+subtotal;

document.getElementById(
"total"
).innerText=
"₹"+total;

}



document.getElementById(
"placeOrder"
)

.onclick=

async()=>{


if(!savedAddress){

savedAddress={

name:
document.getElementById(
"name"
).value,

phone:
document.getElementById(
"phone"
).value,

state:
document.getElementById(
"state"
).value,

district:
document.getElementById(
"district"
).value,

area:
document.getElementById(
"area"
).value,

street:
document.getElementById(
"street"
).value,

pincode:
document.getElementById(
"pincode"
).value

};


if(

Object.values(
savedAddress
).includes("")

){

alert(
"Fill all address fields"
);

return;

}


await setDoc(

doc(
db,
"Users",
currentUser.uid
),

{

address:
savedAddress

},

{

merge:true

}

);

}


const payment=
document.getElementById(
"payment"
).value;

const subtotal=
Number(
currentProduct.price
)*qty;

const total=
subtotal+40;


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
savedAddress.name,

phone:
savedAddress.phone,

address:
savedAddress,

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

};