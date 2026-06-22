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

const categoryFilter=
document.getElementById(
"categoryFilter"
);

let allProducts=[];


async function loadProducts(){

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

<button
class="btn">

View Details

</button>

</div>

`;

});

}


function filterProducts(){

const search=

searchInput.value
.toLowerCase();

const category=

categoryFilter.value;


const filtered=

allProducts.filter((item)=>{

const matchesSearch=

item.name
.toLowerCase()
.includes(search);


const matchesCategory=

category==="" ||

item.category===category;


return matchesSearch
&&
matchesCategory;

});


showProducts(
filtered
);

}


searchInput.addEventListener(
"input",
filterProducts
);

categoryFilter.addEventListener(
"change",
filterProducts
);


loadProducts();