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

let firstProductId = "";


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


/* Move Guest Cart */

async function moveGuestCart(user){

let guestCart=

JSON.parse(
localStorage.getItem(
"guestCart"
)
) || [];


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
item.quantity || 1,

selectedSize:
item.selectedSize || ""

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

cartItems.innerHTML=
"Loading...";

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
padding:40px;
">

<h2>🛒 Cart Empty</h2>

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

if(!firstProductId){

firstProductId=
item.productId;

}

const price=
Number(
item.price || 0
);

const qty=
Number(
item.quantity || 1
);

total +=
price*qty;


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

₹${price}

</div>

<p>

Qty : ${qty}

</p>

<p>

Pack :
${item.selectedSize || "-"}

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


console.log(
snapshot.docs.map(
doc=>doc.data()
)
);


if(snapshot.empty){

cartItems.innerHTML=`

<div style="
text-align:center;
padding:40px;
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


snapshot.forEach(

(itemDoc)=>{

const item=
itemDoc.data();


if(!firstProductId){

firstProductId=
item.productId;

}


const price=
Number(
item.price || 0
);

const qty=
Number(
item.quantity || 1
);

total +=
price*qty;


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

${item.name}

</h3>

<div class="price">

₹${price}

</div>

<p>

Qty : ${qty}

</p>

<p>

Pack :
${item.selectedSize || "-"}

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

loadCart();

showPopup(
"Removed",
"Product removed"
);

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

loadCart();

showPopup(
"Removed",
"Product removed"
);

};


/* Auth */

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

if(!firstProductId){

showPopup(
"Cart Empty",
"Add products first"
);

return;

}

const selectedQty=

localStorage.getItem(
"selectedSize"
)||"";

window.location=

`checkout.html?id=${firstProductId}&qty=${encodeURIComponent(selectedQty)}`;

};