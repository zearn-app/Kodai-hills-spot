import { db } from "./firebase.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const productsDiv =
document.getElementById("products");


async function loadProducts(){

try{

productsDiv.innerHTML="<h3>Loading...</h3>";

const querySnapshot=
await getDocs(
collection(db,"Products")
);

productsDiv.innerHTML="";

querySnapshot.forEach((doc)=>{

const data=doc.data();

productsDiv.innerHTML += `

<div style="
padding:15px;
margin:15px;
border:1px solid #ddd;
border-radius:10px;
background:white;
">

<img
src="${data.Image}"
width="150"
style="border-radius:10px;">

<h3>${data.name}</h3>

<p><b>₹${data.price}</b></p>

<p>${data.description}</p>

<p>Category: ${data.category}</p>

<p>Stock: ${data.Stock}</p>

<button>
Add to Cart
</button>

</div>

`;

});

}
catch(error){

productsDiv.innerHTML=
`<p>${error.message}</p>`;

console.log(error);

}

}

loadProducts();