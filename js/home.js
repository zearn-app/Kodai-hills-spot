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


/* Load products */

async function loadProducts(){

try{

productsDiv.innerHTML=
"Loading...";

const querySnapshot=

await getDocs(

collection(
db,
"Products"
)

);

productsDiv.innerHTML="";


if(
querySnapshot.empty
){

productsDiv.innerHTML=`

<h3>

No Products Available

</h3>

`;

return;

}


querySnapshot.forEach(

(doc)=>{

const data=
doc.data();

productsDiv.innerHTML += `

<div
class="card"
onclick="window.location='product-details.html?id=${doc.id}'">

<img
src="${data.Image || 'logo.png'}">

<h3>

${data.name || 'No Name'}

</h3>

<div class="price">

₹${data.price || 0}

</div>

</div>

`;

});

}

catch(error){

console.log(
"Product Error:",
error
);

productsDiv.innerHTML=`

<h3>

Error loading products

</h3>

`;

}

}


/* Login state */

onAuthStateChanged(

auth,

(user)=>{

if(user){

profileLink.style.display=
"block";

loginFloat.style.display=
"none";

}

else{

profileLink.style.display=
"none";

loginFloat.style.display=
"block";

}

}

);


/* Category click */

const categoryCards=
document.querySelectorAll(
".category-card"
);

categoryCards.forEach(

(card)=>{

card.addEventListener(

"click",

()=>{

const category=

card.querySelector(
".category-name"
)

.innerText;

window.location=

"products.html?category="+

encodeURIComponent(
category
);

}

);

}

);


/* Search */

const searchInput=

document.querySelector(
".search input"
);

searchInput.addEventListener(

"keypress",

(event)=>{

if(
event.key==="Enter"
){

const search=

searchInput.value.trim();

if(search){

window.location=

"products.html?search="+

encodeURIComponent(
search
);

}

}

}

);


/* Start */

loadProducts();