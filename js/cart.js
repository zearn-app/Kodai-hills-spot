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


const cartItems =
document.getElementById(
"cartItems"
);

const totalDiv =
document.getElementById(
"total"
);

const checkoutBtn =
document.getElementById(
"checkoutBtn"
);

let firstProductId="";


/* Popup */

window.showPopup=(title,message)=>{

document.getElementById(
"popupTitle"
).innerText=
title;

document.getElementById(
"popupMessage"
).innerText=
message;

document.getElementById(
"popupBox"
).style.display=
"flex";

};

window.closePopup=()=>{

document.getElementById(
"popupBox"
).style.display=
"none";

};



/* Move guest cart to Firebase */

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

price:
item.price,

image:
item.image,

quantity:
item.quantity||1

}

);

}


localStorage.removeItem(
"guestCart"
);

}



/* Load Cart */

async function loadCart(){

try{

const user=
auth.currentUser;

cartItems.innerHTML=`

<div style="
text-align:center;
padding:30px;
font-size:18px;
">

Loading Products...

</div>

`;


let total=0;

firstProductId="";

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

<h2>

<img src="logo.png">

</h2>

<p style="
margin-top:10px;
color:#666;
">

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

if(!firstProductId){

firstProductId=
item.productId;

}


const price=

Number(
item.price||0
);


total+=price;


const card=

document.createElement(
"div"
);


card.className=
"card";

card.style.animationDelay=
`${index*.25}s`;


card.innerHTML=`

<img

src="${
item.image||
"logo.png"
}"

onerror="
this.src='logo.png'
"

>

<div class="details">

<h3>

${
item.name||
"No Product"
}

</h3>

<div class="price">

₹${price}

</div>

<p>

Qty :
${item.quantity||1}

</p>

<button

class="remove"

onclick="removeGuestItem(${index})"

>

Remove

</button>

</div>

`;


cartItems.appendChild(
card
);

}

);


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

await getDocs(
q
);


if(snapshot.empty){

cartItems.innerHTML=`

<div style="
text-align:center;
padding:50px;
">

<h2>

🛒 Cart Empty

</h2>

</div>

`;

totalDiv.innerText=
"Total : ₹0";

return;

}


let index=0;


snapshot.forEach(

(itemDoc)=>{

const item=
itemDoc.data();


if(!firstProductId){

firstProductId=
item.productId;

}


const price =
Number(item.price || 0);

const qty =
Number(item.quantity || 1);

total += price * qty;


const card=

document.createElement(
"div"
);


card.className=
"card";

card.style.animationDelay=
`${index*.25}s`;


card.innerHTML=`

<img

src="${
item.image||
"logo.png"
}"

onerror="
this.src='logo.png'
"

>

<div class="details">

<h3>

${
item.name||
"No Product"
}

</h3>

<div class="price">

₹${price}

</div>

<p>

Qty :
${item.quantity||1}

</p>

<button

class="remove"

onclick="removeItem('${itemDoc.id}')"

>

Remove

</button>

</div>

`;


cartItems.appendChild(
card
);

index++;

}

);


totalDiv.innerText=

`Total : ₹${total}`;

}

catch(error){

console.log(
error
);

showPopup(

"Error",

"Unable to load cart"

);

}

}



/* Remove Firebase Item */

window.removeItem=

async(id)=>{

try{

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

}

catch(error){

console.log(error);

}

};



/* Remove Guest Item */

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



/* Auth */

auth.onAuthStateChanged(

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

"Please login to continue checkout"

);

return;

}


if(!firstProductId){

showPopup(

"Cart Empty",

"Please add products"

);

return;

}


window.location=

`checkout.html?id=${firstProductId}`;

};