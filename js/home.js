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


const productsDiv =
document.getElementById(
"products"
);

const profileLink =
document.getElementById(
"profileLink"
);

const loginFloat =
document.getElementById(
"loginFloat"
);


/* Dynamic Styles */

const style =
document.createElement(
"style"
);

style.innerHTML = `

.card{
position:relative;
cursor:pointer;
}

.stock-badge{
position:absolute;
top:8px;
right:8px;

background:red;
color:white;

padding:5px 10px;

border-radius:20px;

font-size:12px;
font-weight:bold;

z-index:2;
}

.pack{
margin-top:5px;
font-size:13px;
font-weight:bold;
color:#666;
}

.price-box{
display:flex;
align-items:center;
gap:10px;

margin:10px 0;
}

.old-price{
color:#ff3b30;
font-size:15px;

opacity:.7;

text-decoration-line:line-through;
text-decoration-thickness:2px;
}

.new-price{
color:#2e7d32;
font-size:22px;
font-weight:bold;
}

`;

document.head.appendChild(
style
);


/* Load Products */

async function loadProducts(){

try{

productsDiv.innerHTML = `

<h3 style="
text-align:center;
padding:20px;
">

Loading...

</h3>

`;

const snapshot =
await getDocs(

collection(
db,
"Products"
)

);

productsDiv.innerHTML = "";


/* Empty Products */

if(snapshot.empty){

productsDiv.innerHTML = `

<h3 style="
text-align:center;
padding:20px;
">

No Products Available

</h3>

`;

return;

}


/* Product Loop */

snapshot.forEach((doc)=>{

const data =
doc.data();

const realPrice =
Number(
data.price || 0
);

const oldPrice =
Number(
data.oldPrice ||
(realPrice+50)
);

const packQty =
data.packQty || "";

const fewStock =
data.fewStock || false;

productsDiv.innerHTML += `

<div
class="card"
onclick="openProduct('${doc.id}')"
>

${fewStock ?

`<div class="stock-badge">

Few Stock

</div>`

:

""

}

<img
src="${
data.Image || "logo.png"
}"

onerror="
this.src='logo.png'
"
>

<h3>

${
data.name || "No Name"
}

</h3>

${
packQty ?

`

<div class="pack">

📦 ${packQty}

</div>

`

:

""
}

<div class="price-box">

<span class="old-price">

₹${oldPrice}

</span>

<span class="new-price">

₹${realPrice}

</span>

</div>

<button class="btn">

🛒 Add Cart

</button>

</div>

`;

});

}

catch(error){

console.log(
"Product Error:",
error
);

productsDiv.innerHTML = `

<h3 style="
text-align:center;
padding:20px;
color:red;
">

Error Loading Products

</h3>

`;

}

}


/* Open Product */

window.openProduct = (id)=>{

window.location =
`product-details.html?id=${id}`;

};


/* Auth Check */

onAuthStateChanged(

auth,

(user)=>{

if(user){

if(profileLink){

profileLink.style.display =
"block";

}

if(loginFloat){

loginFloat.style.display =
"none";

}

}

else{

if(profileLink){

profileLink.style.display =
"none";

}

if(loginFloat){

loginFloat.style.display =
"block";

}

}

}

);


/* Category Click */

const categoryCards =
document.querySelectorAll(
".category-card"
);

categoryCards.forEach(

(card)=>{

card.onclick = ()=>{

const categoryElement =
card.querySelector(
".category-name"
);

const category =
categoryElement
? categoryElement.innerText
: card.innerText;

window.location =

`products.html?category=${encodeURIComponent(category)}`;

};

}

);


/* Search */

const searchInput =
document.querySelector(
".search input"
);

if(searchInput){

searchInput.addEventListener(

"keypress",

(event)=>{

if(event.key==="Enter"){

const search =
searchInput.value.trim();

if(search){

window.location =

`products.html?search=${encodeURIComponent(search)}`;

}

}

}

);

}


/* Start */

loadProducts();