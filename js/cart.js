import { auth, db } from "./firebase.js";

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


const cartItems =
document.getElementById("cartItems");

const totalDiv =
document.getElementById("total");

const checkoutBtn =
document.getElementById("checkoutBtn");

let cartData=[];


/* POPUP */

window.showPopup=(title,message)=>{

document.getElementById(
"popupTitle"
).innerText=title;

document.getElementById(
"popupMessage"
).innerText=message;

document.getElementById(
"popupBox"
).style.display="flex";

};

window.closePopup=()=>{

document.getElementById(
"popupBox"
).style.display="none";

};



/* Move Guest Cart To Firebase */

async function moveGuestCart(user){

let guestCart=

JSON.parse(
localStorage.getItem(
"guestCart"
)
)||[];


if(guestCart.length===0){
return;
}


for(let item of guestCart){

await addDoc(

collection(
db,
"Cart"
),

{

uid:user.uid,

productId:
item.productId,

name:
item.name,

image:
item.image,

quantity:
item.quantity || 1,

pack:
item.pack || "",

unitPrice:
item.unitPrice || 0,

totalPrice:
item.totalPrice || 0

}

);

}

localStorage.removeItem(
"guestCart"
);

}



/* Create Card */

function createCard(
item,
removeFunction
){

const qty=
Number(
item.quantity || 1
);

const unitPrice=
Number(
item.unitPrice || 0
);

const itemTotal=
Number(
item.totalPrice ||
(unitPrice*qty)
);

const card=
document.createElement(
"div"
);

card.className=
"card";

card.innerHTML=`

<img
src="${item.image || "logo.png"}"
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

Unit Price :
₹${unitPrice}

</p>

<p>

Qty :
${qty}

</p>

<p>

Pack :
${item.pack || "-"}

</p>

<button
class="remove"
onclick="${removeFunction}"
>

Remove

</button>

</div>

`;

return {
card,
itemTotal
};

}



/* Load Cart */

async function loadCart(){

try{

cartItems.innerHTML=
"Loading...";

cartData=[];

let total=0;

const user=
auth.currentUser;

cartItems.innerHTML="";


/* Guest Cart */

if(!user){

let guestCart=

JSON.parse(
localStorage.getItem(
"guestCart"
)
)||[];


if(guestCart.length===0){

cartItems.innerHTML=`

<div style="
text-align:center;
padding:50px;
">

<img src="empty-cart.jpg">

<p>

Add products to continue

</p>

</div>

`;

totalDiv.innerText=
"Total : ₹0";

return;
}


guestCart.forEach(

(item,index)=>{

cartData.push(item);

const result=

createCard(

item,

`removeGuestItem(${index})`

);

total+=
result.itemTotal;

cartItems.appendChild(
result.card
);

});

totalDiv.innerText=
`Total : ₹${total}`;

return;

}


/* Firebase Cart */

const q=

query(

collection(
db,
"Cart"
),

where(
"uid",
"==",
user.uid
)

);

const snapshot=

await getDocs(q);


if(snapshot.empty){

cartItems.innerHTML=`

<div style="
text-align:center;
padding:50px;
">


<img src="empty-cart.jpg">

</div>

`;

totalDiv.innerText=
"Total : ₹0";

return;

}


snapshot.forEach(

(itemDoc)=>{

const item=
itemDoc.data();

item.docId=
itemDoc.id;

cartData.push(item);

const result=

createCard(

item,

`removeItem('${itemDoc.id}')`

);

total+=
result.itemTotal;

cartItems.appendChild(
result.card
);

});


totalDiv.innerText=
`Total : ₹${total}`;

}

catch(error){

console.log(error);

showPopup(
"Error",
"Unable to load cart"
);

}

}



/* Remove Firebase */

window.removeItem=

async(id)=>{

await deleteDoc(

doc(
db,
"Cart",
id
)

);

showPopup(
"Removed",
"Product removed"
);

loadCart();

};



/* Remove Guest */

window.removeGuestItem=

(index)=>{

let guestCart=

JSON.parse(
localStorage.getItem(
"guestCart"
)
)||[];

guestCart.splice(
index,
1
);

localStorage.setItem(

"guestCart",

JSON.stringify(
guestCart
)

);

showPopup(
"Removed",
"Product removed"
);

loadCart();

};



/* Login */

onAuthStateChanged(

auth,

async(user)=>{

if(user){

await moveGuestCart(
user
);

}

loadCart();

}

);



/* Checkout */

checkoutBtn.onclick=()=>{

if(!auth.currentUser){

showPopup(

"Login Required",

"Please login first"

);

return;

}


if(cartData.length===0){

showPopup(

"Cart Empty",

"Add products first"

);

return;

}


/* Save checkout data */

localStorage.setItem(

"checkoutItems",

JSON.stringify(
cartData
)

);


window.location=
"checkout.html";

};