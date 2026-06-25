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
document.querySelectorAll(".category-card");

const profileNav=
document.getElementById("profileNav");


let allProducts=[];
let selectedCategory="";
let currentUser=null;


/* Auth */

onAuthStateChanged(

auth,

(user)=>{

currentUser=user;


/* Bottom navbar login/profile */

if(profileNav){

if(user){

profileNav.href=
"profile.html";

profileNav.innerHTML=`

👤<br>
Yours

`;

}

else{

profileNav.href=
"login.html";

profileNav.innerHTML=`

🔐<br>
Login

`;

}

}

}

);


/* Product Loading */

async function loadProducts(){

try{

productsDiv.innerHTML=`

<div style="
text-align:center;
padding:20px;
">

Loading Products...

</div>

`;

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


showProducts(allProducts);

}

catch(error){

console.log(error);

productsDiv.innerHTML=`

<h3 style="
text-align:center;
color:red;
padding:20px;
">

Error Loading Products

</h3>

`;

}

}


/* Show Products */

function showProducts(products){

productsDiv.innerHTML="";


if(products.length===0){

productsDiv.innerHTML=`

<h3 style="
text-align:center;
padding:20px;
">

No Products Found

</h3>

`;

return;

}


products.forEach((product)=>{

const oldPrice=

product.oldPrice ||

(Number(product.price||0)+50);


productsDiv.innerHTML+=`

<div class="card">

${
product.fewStock===true

?

`

<div class="stock-badge">

Few Stock

</div>

`

:

""

}

<img

src="${product.Image||'logo.png'}"

onclick="openProduct('${product.id}')"

onerror="this.src='logo.png'"

>


<h3>

${product.name||"No Name"}

</h3>


${
product.packQty

?

`

<div class="pack">

📦 ${product.packQty}

</div>

`

:

""

}


<div style="
margin-top:10px;
">

<span class="old-price">

₹${oldPrice}

</span>

<span class="price">

₹${product.price||0}

</span>

</div>


<button

class="btn"

onclick="addToCart('${product.id}')"

>

🛒 Add Cart

</button>

</div>

`;

});

}



/* Open Product */

window.openProduct=

(id)=>{

window.location=

`product-details.html?id=${id}`;

};



/* Add To Cart */

window.addToCart=

async(id)=>{

try{

if(!currentUser){

window.location=
"login.html";

return;

}


const product=

allProducts.find(

item=>item.id===id

);


if(!product){

alert(
"Product not found"
);

return;

}


await addDoc(

collection(
db,
"Cart"
),

{

uid:
currentUser.uid,

productId:
id,

name:
product.name,

price:
Number(product.price),

image:
product.Image,

quantity:1,

oldPrice:

product.oldPrice ||

(Number(product.price)+50),

fewStock:

product.fewStock||false,

packQty:

product.packQty||"",

createdAt:

Date.now()

}

);


alert(
"Added to cart"
);

}

catch(error){

console.log(error);

alert(error.message);

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

filtered.filter(

item=>

(item.name||"")

.toLowerCase()

.includes(search)

);


/* Category */

if(selectedCategory!=""){

filtered=

filtered.filter(

item=>

item.category

?.toLowerCase()

===

selectedCategory
.toLowerCase()

);

}


/* Sort */

if(priceFilter.value==="low"){

filtered.sort(

(a,b)=>

Number(a.price)

-

Number(b.price)

);

}

else if(priceFilter.value==="high"){

filtered.sort(

(a,b)=>

Number(b.price)

-

Number(a.price)

);

}

else if(priceFilter.value==="buy"){

filtered.sort(

(a,b)=>

(b.buyCount||0)

-

(a.buyCount||0)

);

}


showProducts(filtered);

}


/* Events */

searchInput.addEventListener(

"input",

filterProducts

);


priceFilter.addEventListener(

"change",

filterProducts

);


categoryCards.forEach(

(card)=>{

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

}

);


/* Start */

loadProducts();