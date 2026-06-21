import { db } from "./firebase.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const productsDiv =
document.getElementById("Products");

async function loadProducts(){

const querySnapshot =
await getDocs(
collection(db,"Products")
);

querySnapshot.forEach((doc)=>{

const data=doc.data();

productsDiv.innerHTML +=`

<div style="
padding:15px;
margin:10px;
border:1px solid #ddd;
border-radius:10px;
">

<img
src="${data.image}"
width="150">

<h3>${data.name}</h3>

<p>₹${data.price}</p>

<p>${data.description}</p>

<button>
Add to Cart
</button>

</div>

`;

});

}

loadProducts();