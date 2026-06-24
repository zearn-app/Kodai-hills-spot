import { db }
from "./firebase.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


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

<div class="card"

onclick="window.location='product-details.html?id=${product.id}'"

style="cursor:pointer">

<img src="${product.Image}">

<h3>

${product.name}

</h3>

<div class="price">

₹${product.price}

</div>

<button class="btn">

View Details

</button>

</div>

`;

});

}


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

if(priceFilter.value==="low"){

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


/* Price filter */

priceFilter
.addEventListener(
"change",
filterProducts
);


/* Category click */

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