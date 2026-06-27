import {db,auth}
from "./firebase.js";

import{
collection,
getDocs,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import{
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const productsDiv=document.getElementById("products");
const searchInput=document.getElementById("searchInput");
let priceFilter="";
const categoryCards=document.querySelectorAll(".category-card");
const profileNav=document.getElementById("profileNav");

let allProducts=[];
let currentUser=null;
let selectedCategory="";

onAuthStateChanged(auth,(user)=>{

currentUser=user;

if(user){

profileNav.href="profile.html";

profileNav.innerHTML=`
👤<br>Yours
`;

}else{

profileNav.href="login.html";

profileNav.innerHTML=`
🔐<br>Login
`;

}

});

async function loadProducts(){

const snapshot=await getDocs(
collection(db,"Products")
);

allProducts=[];

snapshot.forEach(doc=>{

allProducts.push({

id:doc.id,
...doc.data()

});

});

showProducts(allProducts);

}

function showProducts(products){

productsDiv.innerHTML="";

if(products.length===0){

productsDiv.innerHTML=`
<h3>No Products</h3>
`;

return;

}

products.forEach(product=>{

const div=document.createElement("div");

div.className="card";

div.innerHTML=`

<img src="${product.Image||'logo.png'}">

<h3>${product.name}</h3>

<div>

<span class="old-price">
₹${product.oldPrice||Number(product.price)+50}
</span>

<span class="price">
₹${product.price}
</span>


</div>

<button class="btn">

🛒 Add To Cart

</button>


`;

div.onclick=()=>{

window.location=
`product-details.html?id=${product.id}`;

};

const button=
div.querySelector(".btn");

button.onclick=(e)=>{

e.stopPropagation();

addToCart(product);

};

productsDiv.appendChild(div);

});

}

async function addToCart(product){

let cart=
JSON.parse(
localStorage.getItem("cart")
)||[];

const existing=
cart.find(
item=>item.id===product.id
);

if(existing){

existing.quantity++;

}else{

cart.push({

id:product.id,
name:product.name,
price:product.price,
image:product.Image,
quantity:1

});

}

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

if(currentUser){

await addDoc(
collection(db,"Cart"),
{

uid:currentUser.uid,
productId:product.id,
name:product.name,
price:Number(product.price),
image:product.Image,
quantity:1,
createdAt:Date.now()

}
);

}

const btn=document.querySelector(".cart-btn");

btn.style.transform="scale(1.3)";

setTimeout(()=>{

btn.style.transform="scale(1)";

},300);

}

function filterProducts(){

let filtered=[...allProducts];

const search=
searchInput.value
.toLowerCase();

filtered=
filtered.filter(item=>

(item.name||"")
.toLowerCase()
.includes(search)

);

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


/* Price sorting */

if(priceFilter==="low"){

filtered.sort(

(a,b)=>

Number(a.price)-Number(b.price)

);

}

if(priceFilter==="high"){

filtered.sort(

(a,b)=>

Number(b.price)-Number(a.price)

);

}

showProducts(filtered);

}

searchInput.addEventListener(
"input",
filterProducts
);

const filterPopup=
document.getElementById(
"filterPopup"
);

const openFilter=
document.getElementById(
"openFilter"
);

openFilter.onclick=()=>{

filterPopup.style.display=
"flex";

};

document.getElementById(
"closePopup"
).onclick=()=>{

filterPopup.style.display=
"none";

};


document
.querySelectorAll(
".popup-btn"
)

.forEach(btn=>{

btn.onclick=()=>{

priceFilter=
btn.dataset.value;

filterProducts();

filterPopup.style.display=
"none";

};

});

categoryCards.forEach(card=>{

card.onclick=()=>{

selectedCategory=
card.innerText
.replace(/[^\w\s]/gi,"")
.trim();

filterProducts();

};

});

loadProducts();