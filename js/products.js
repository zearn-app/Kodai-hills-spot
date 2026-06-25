import { db, auth }
from "./firebase.js";

import {
collection,
getDocs,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const productsDiv=
document.getElementById("products");

const searchInput=
document.getElementById("searchInput");

const priceFilter=
document.getElementById("priceFilter");

const categoryCards=
document.querySelectorAll(
".category-card"
);

let allProducts=[];
let selectedCategory="";
let currentUser=null;


/* User Auth */

onAuthStateChanged(

auth,

(user)=>{

currentUser=user;

}

);


/* Load Products */

async function loadProducts(){

try{

productsDiv.innerHTML=
"Loading Products...";

const snapshot=
await getDocs(
collection(
db,
"Products"
)
);

allProducts=[];

snapshot.forEach((doc)=>{

allProducts.push({

id:doc.id,
...doc.data()

});

});

showProducts(
allProducts
);

}

catch(error){

console.log(error);

productsDiv.innerHTML=
"<h3>Error Loading Products</h3>";

}

}


/* Show Products */

function showProducts(products){

productsDiv.innerHTML="";

if(products.length===0){

productsDiv.innerHTML=
"<h3>No Products Found</h3>";

return;

}

products.forEach((product)=>{

productsDiv.innerHTML+=`

<div class="card">

<img
src="${product.Image}"
onclick="openProduct(
'${product.id}'
)">

<h3>

${product.name}

</h3>

<div>

<span style="
text-decoration:line-through;
color:red;
font-size:14px;
margin-right:8px;
">

₹${product.oldPrice || (Number(product.price)+50)}

</span>

<span
class="price">

₹${product.price}

</span>

</div>

<button
class="btn"
onclick="addToCart(
'${product.id}',
'${product.name}',
'${product.price}',
'${product.Image}'
)">

🛒 Add Cart

</button>

</div>

`;

});

}


/* Open Product */

window.openProduct=(id)=>{

window.location=
`product-details.html?id=${id}`;

};


/* Add Cart */

window.addToCart=

async(
id,
name,
price,
image
)=>{

try{

if(!currentUser){

window.location=
"login.html";

return;

}

await addDoc(

collection(
db,
"Cart"
),

{

uid:currentUser.uid,

productId:id,

name:name,

price:Number(price),

image:image,

quantity:1,

createdAt:Date.now()

}

);

alert(
"Added to cart"
);

}

catch(error){

console.log(error);

alert(
error.message
);

}

};


/* Filter */

function filterProducts(){

let filtered=
[...allProducts];


/* Search */

const search=
searchInput.value
.toLowerCase();

filtered=
filtered.filter(item=>

item.name
.toLowerCase()
.includes(search)

);


/* Category */

if(selectedCategory!=""){

filtered=
filtered.filter(item=>

item.category
?.toLowerCase()

===

selectedCategory
.toLowerCase()

);

}


/* Sort */

if(
priceFilter.value==="low"
){

filtered.sort(

(a,b)=>

Number(a.price)
-
Number(b.price)

);

}

else if(
priceFilter.value==="high"
){

filtered.sort(

(a,b)=>

Number(b.price)
-
Number(a.price)

);

}

else if(
priceFilter.value==="buy"
){

filtered.sort(

(a,b)=>

(b.buyCount||0)
-
(a.buyCount||0)

);

}

showProducts(
filtered
);

}


/* Events */

searchInput
.addEventListener(
"input",
filterProducts
);

priceFilter
.addEventListener(
"change",
filterProducts
);


categoryCards
.forEach(card=>{

card.onclick=()=>{

document
.querySelectorAll(
".category-card"
)

.forEach(c=>{

c.style.background=
"white";

c.style.color=
"black";

});

card.style.background=
"#2e7d32";

card.style.color=
"white";

selectedCategory=

card.innerText

.replace("🍫","")
.replace("🥑","")
.replace("🥔","")
.replace("🌿","")

.trim();

filterProducts();

};

});


loadProducts();