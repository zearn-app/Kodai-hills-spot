import { db } from "./firebase.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productsDiv=
document.getElementById("products");

const searchInput=
document.getElementById("searchInput");

const categoryFilter=
document.getElementById("categoryFilter");

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

allProducts.push(
doc.data()
);

});

showProducts(allProducts);

}


function showProducts(products){

productsDiv.innerHTML="";

products.forEach(data=>{

productsDiv.innerHTML +=`

<div class="card">

<img src="${data.Image}">

<h3>${data.name}</h3>

<div class="price">

₹${data.price}

</div>

<button
class="btn"
onclick='addToCart(${JSON.stringify(data)})'>

Add to Cart

</button>

</div>

`;

});

}


searchInput.addEventListener(
"input",
filterProducts
);

categoryFilter.addEventListener(
"change",
filterProducts
);


function filterProducts(){

let search=
searchInput.value.toLowerCase();

let category=
categoryFilter.value;


let filtered=

allProducts.filter(product=>{

let matchSearch=

product.name
.toLowerCase()
.includes(search);

let matchCategory=

category==="" ||

product.category===category;

return matchSearch &&
matchCategory;

});


showProducts(filtered);

}


loadProducts();