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
document.getElementById(
"products"
);

const searchInput=
document.getElementById(
"searchInput"
);

const priceFilter=
document.getElementById(
"priceFilter"
);

const categoryCards=
document.querySelectorAll(
".category-card"
);

let allProducts=[];

let selectedCategory="";

let currentUser=null;


/* Login state */

onAuthStateChanged(

auth,

(user)=>{

currentUser=user;

}

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

allProducts=[];

querySnapshot.forEach((doc)=>{

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
"<h3>Error loading products</h3>";

}

}


/* Show products */

function showProducts(products){

productsDiv.innerHTML="";


if(products.length===0){

productsDiv.innerHTML=
"<h3>No products found</h3>";

return;

}


products.forEach((product)=>{

productsDiv.innerHTML+=`

<div class="card">

<img
src="${product.Image}"

onclick="window.location='product-details.html?id=${product.id}'"

style="cursor:pointer">

<h3>

${product.name}

</h3>

<div class="price">

₹${product.price}

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


/* Add Cart */

window.addToCart=

async(
id,
name,
price,
image
)=>{

event.stopPropagation();

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

price:price,

image:image,

quantity:1

}

);

alert(
"Added to Cart"
);

}

catch(error){

console.log(error);

alert(
error.message
);

}

};


/* Filter products */

function filterProducts(){

let filtered=
[...allProducts];


const search=

searchInput.value
.toLowerCase();


filtered=
filtered.filter(item=>

item.name
.toLowerCase()
.includes(search)

);


if(selectedCategory!==""){

filtered=
filtered.filter(item=>

item.category
.toLowerCase()===
selectedCategory
.toLowerCase()

);

}


/* Price sorting */

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


/* Search */

searchInput
.addEventListener(
"input",
filterProducts
);


/* Price Filter */

priceFilter
.addEventListener(
"change",
filterProducts
);


/* Category Click */

categoryCards
.forEach(card=>{

card.onclick=()=>{

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