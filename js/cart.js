import { auth, db }
from "./firebase.js";

import {
collection,
query,
where,
getDocs,
deleteDoc,
doc,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const cartItems=
document.getElementById(
"cartItems"
);

const totalDiv=
document.getElementById(
"total"
);

let cart=[];


/* login */

onAuthStateChanged(

auth,

async(user)=>{


if(user){

await moveLocalCart(
user.uid
);

loadCart(
user.uid
);

}

else{

loadGuestCart();

}

});


/* move local cart */

async function moveLocalCart(uid){

let guestCart=

JSON.parse(

localStorage.getItem(
"guestCart"
)

)||[];


if(
guestCart.length===0
)return;


for(let item of guestCart){

await addDoc(

collection(
db,
"Cart"
),

{

uid:uid,

...item

}

);

}


localStorage.removeItem(
"guestCart"
);

}


/* guest cart */

function loadGuestCart(){

cart=

JSON.parse(

localStorage.getItem(
"guestCart"
)

)||[];

showCart();

}


/* firebase cart */

async function loadCart(uid){

const q=query(

collection(
db,
"Cart"
),

where(
"uid",
"==",
uid
)

);

const snapshot=
await getDocs(q);

cart=[];

snapshot.forEach((item)=>{

cart.push({

docId:item.id,

...item.data()

});

});

showCart();

}


/* display */

function showCart(){

cartItems.innerHTML="";

let total=0;


if(cart.length===0){

cartItems.innerHTML=
"<h2>Cart Empty</h2>";

totalDiv.innerText=
"Total : ₹0";

return;

}


cart.forEach((item)=>{

total+=
item.price*
item.quantity;


cartItems.innerHTML+=`

<div class="card">

<img src="${item.image}">

<div class="details">

<h3>
${item.name}
</h3>

<div class="price">

₹${item.price}

</div>

<p>

Quantity:
${item.quantity}

</p>

${
item.docId ?

`<button
class="remove"
onclick="removeItem('${item.docId}')">

Remove

</button>`

:

`<button
class="remove"
onclick="removeGuest('${item.productId}')">

Remove

</button>`

}

</div>

</div>

`;

});


totalDiv.innerText=
"Total : ₹"+total;

}


/* remove firebase */

window.removeItem=
async(docId)=>{

await deleteDoc(

doc(
db,
"Cart",
docId
)

);

location.reload();

};


/* remove guest */

window.removeGuest=
(id)=>{

cart=
cart.filter(

x=>

x.productId!=id

);

localStorage.setItem(

"guestCart",

JSON.stringify(
cart
)

);

showCart();

};