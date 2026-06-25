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


/* Extra styles */

const style=
document.createElement(
"style"
);

style.innerHTML=`

.card{
position:relative;
}

.stock-badge{

position:absolute;
top:8px;
right:8px;
background:red;
color:white;
padding:5px 10px;
border-radius:20px;
font-size:11px;
font-weight:bold;
z-index:10;

}

.pack{

font-size:13px;
margin-top:5px;
color:#666;
font-weight:bold;

}

`;

document.head.appendChild(
style
);


/* Auth */

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

console.log(
error
);

productsDiv.innerHTML=`

<h3>

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

<h3>

No Products Found

</h3>

`;

return;

}


products.forEach((product)=>{

const oldPrice=

product.oldPrice

?

product.oldPrice

:

Number(product.price||0)+50;


productsDiv.innerHTML+=`

<div class="card">


${
product.fewStock===true

?

`<div class="stock-badge">

Few Stock

</div>`

:

""
}


<img
src="${
product.Image||
"logo.png"
}"

onclick="openProduct(
'${product.id}'
)"

onerror="
this.src='logo.png'
">


<h3>

${product.name||"No Name"}

</h3>


${
product.packQty

?

`<div class="pack">

📦 ${product.packQty}

</div>`

:

""
}


<div>

<span style="
text-decoration:line-through;
color:red;
font-size:14px;
margin-right:8px;
">

₹${oldPrice}

</span>


<span class="price">

₹${product.price}

</span>

</div>


<button
class="btn"

onclick="addToCart(
'${product.id}'
)">

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



/* Add Cart */

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

item=>

item.id===id

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

uid:currentUser.uid,

productId:id,

name:
product.name,

price:
Number(
product.price
),

image:
product.Image,

quantity:1,


oldPrice:
product.oldPrice||

(
Number(product.price)
+50
),

fewStock:
product.fewStock||
false,

packQty:
product.packQty||
"",

createdAt:
Date.now()

}

);


alert(
"Added to cart"
);

}

catch(error){

console.log(
error
);

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
filtered.filter(

item=>

item.name
.toLowerCase()
.includes(
search
)

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