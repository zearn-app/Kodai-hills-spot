import { auth, db }
from "./firebase.js";

import {
collection,
query,
where,
getDocs,
deleteDoc,
doc
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


/* Check login */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"login.html";

return;

}

loadCart(
user.uid
);

}

);


/* Load Cart */

async function loadCart(uid){

try{

cartItems.innerHTML=
"Loading...";

const q=

query(

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
catch(error){

console.log(error);

cartItems.innerHTML=

"<h2>Error loading cart</h2>";

}

}


/* Show cart */

function showCart(){

cartItems.innerHTML="";

let total=0;


if(cart.length===0){

cartItems.innerHTML=`

<h2>

Cart Empty

</h2>

`;

totalDiv.innerText=

"Total : ₹0";

return;

}


cart.forEach((item,index)=>{

total +=

Number(item.price)*
Number(item.quantity);


cartItems.innerHTML+=`

<div class="card"

onclick="window.location='product-details.html?id=${item.productId}'"

style="cursor:pointer">

<img src="${item.image}">

<div class="details">

<h3>

${item.name}

</h3>

<div class="price">

₹${item.price}

</div>

<p>

Quantity :
${item.quantity}

</p>

<button
class="remove"

onclick="event.stopPropagation();
removeItem('${item.docId}')">

Remove

</button>

</div>

</div>

`;

});


totalDiv.innerText=

"Total : ₹"+total;

}


/* Remove */

window.removeItem=

async(docId)=>{

try{

await deleteDoc(

doc(
db,
"Cart",
docId
)

);

cart=

cart.filter(

item=>

item.docId!==docId

);

showCart();

}
catch(error){

alert(
error.message
);

}

};