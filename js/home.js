import { db, auth }
from "./firebase.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const productsDiv=
document.getElementById(
"products"
);

const profileLink=
document.getElementById(
"profileLink"
);

const loginFloat=
document.getElementById(
"loginFloat"
);


/* Load Products */

async function loadProducts(){

try{

productsDiv.innerHTML=
"<h3>Loading...</h3>";

const snapshot=
await getDocs(
collection(
db,
"Products"
)
);

productsDiv.innerHTML="";

if(snapshot.empty){

productsDiv.innerHTML=`

<h3>
No Products Available
</h3>

`;

return;

}


snapshot.forEach((doc)=>{

const data=
doc.data();

const realPrice=
Number(
data.price||0
);

/* Make strike price larger */

const oldPrice=
realPrice+50;


productsDiv.innerHTML+=`

<div
class="card"
onclick="openProduct(
'${doc.id}'
)">

<img
src="${
data.Image||
'logo.png'
}"

onerror="
this.src='logo.png'
">

<h3>

${
data.name||
'No Name'
}

</h3>


<div
class="price-box">

<span
class="old-price">

₹${oldPrice}

</span>

<span
class="new-price">

₹${realPrice}

</span>

</div>

</div>

`;

});

}

catch(error){

console.log(
error
);

productsDiv.innerHTML=`

<h3>

Error Loading Products

</h3>

`;

}

}


/* Open Product */

window.openProduct=
(id)=>{

window.location=

`product-details.html?id=${id}`;

};


/* Auth Check */

onAuthStateChanged(

auth,

(user)=>{

if(user){

if(profileLink){

profileLink.style.display=
"block";

}

if(loginFloat){

loginFloat.style.display=
"none";

}

}

else{

if(profileLink){

profileLink.style.display=
"none";

}

if(loginFloat){

loginFloat.style.display=
"block";

}

}

}

);


/* Category Click */

const categoryCards=
document.querySelectorAll(
".category-card"
);

categoryCards.forEach(

(card)=>{

card.onclick=()=>{

const category=

card.querySelector(
".category-name"
)

.innerText;

window.location=

`products.html?category=${encodeURIComponent(category)}`;

};

}

);


/* Search */

const searchInput=

document.querySelector(
".search input"
);

if(searchInput){

searchInput.addEventListener(

"keypress",

(event)=>{

if(
event.key==="Enter"
){

const search=

searchInput.value
.trim();

if(search){

window.location=

`products.html?search=${encodeURIComponent(search)}`;

}

}

}

);

}


/* Start */

loadProducts();