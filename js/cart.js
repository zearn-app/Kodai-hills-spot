import {auth,db}
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


const cartItems=
document.getElementById(
"cartItems"
);

const totalDiv=
document.getElementById(
"total"
);

const checkoutBtn=
document.getElementById(
"checkoutBtn"
);

let firstProductId="";


/* POPUP */

window.showPopup=(

title,
message

)=>{

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


/* LOAD CART */

async function loadCart(){

try{

const user=
auth.currentUser;


if(!user){

window.location=
"login.html";

return;

}


cartItems.innerHTML=`

<div style="
text-align:center;
padding:30px;
font-size:18px;
">

Loading Products...

</div>

`;


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


cartItems.innerHTML="";


let total=0;

firstProductId="";


if(snapshot.empty){

cartItems.innerHTML=`

<div style="
text-align:center;
padding:50px;
animation:fadeIn 1s;
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


if(
!firstProductId
){

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
item.image||'logo.png'
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

${
item.quantity||1
}

</p>


<button

class="remove"

onclick="removeItem(

'${itemDoc.id}'

)"

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



/* REMOVE ITEM */

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

"Product removed successfully"

);


loadCart();

}

catch(error){

console.log(
error
);

showPopup(

"Error",

"Unable to remove item"

);

}

};



/* AUTH CHECK */

auth.onAuthStateChanged(

(user)=>{

if(user){

loadCart();

}

else{

window.location=

"login.html";

}

});



/* CHECKOUT */

checkoutBtn.onclick=()=>{


if(
!firstProductId
){

showPopup(

"Cart Empty",

"Please add products"

);

return;

}


window.location=

`checkout.html?id=${firstProductId}`;

};