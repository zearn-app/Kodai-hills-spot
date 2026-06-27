import { db, auth } from "./firebase.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const productsDiv =
document.getElementById("products");

const profileNav =
document.getElementById("profileNav");

const searchInput =
document.querySelector(".search input");

const categoryCards =
document.querySelectorAll(".category-card");


/* Dynamic Styles */

const style=document.createElement("style");

style.innerHTML=`

.card{
position:relative;
cursor:pointer;
background:white;
min-width:180px;
padding:10px;
border-radius:15px;
box-shadow:0 2px 10px rgba(0,0,0,.1);
animation:slideUp .7s;
}

.card img{
width:100%;
height:150px;
object-fit:cover;
border-radius:10px;
}

.card h3{
margin-top:10px;
font-size:16px;
}

.stock-badge{
position:absolute;
top:8px;
right:8px;
background:red;
color:white;
padding:5px 10px;
border-radius:20px;
font-size:12px;
font-weight:bold;
z-index:2;
}

.pack{
margin-top:5px;
font-size:13px;
font-weight:bold;
color:#666;
}

.price-box{
display:flex;
align-items:center;
gap:10px;
margin:10px 0;
}

.old-price{
color:#ff3b30;
font-size:15px;
opacity:.7;
text-decoration:line-through;
}

.new-price{
color:#2e7d32;
font-size:22px;
font-weight:bold;
}

.btn{
width:100%;
padding:12px;
border:none;
border-radius:10px;
background:#2e7d32;
color:white;
cursor:pointer;
}

.btn:active{
transform:scale(.95);
}

`;

document.head.appendChild(style);



/* Load Products */

async function loadProducts(){

try{

productsDiv.innerHTML=`

<h3 style="
text-align:center;
padding:20px;
">

Loading...

</h3>

`;

const snapshot = await getDocs(
collection(db,"Products")
);

productsDiv.innerHTML="";


if(snapshot.empty){

productsDiv.innerHTML=`

<h3 style="
text-align:center;
padding:20px;
">

No Products Available

</h3>

`;

return;

}


snapshot.forEach((doc)=>{

const data=doc.data();

const realPrice=
Number(data.price || 0);

const oldPrice=
data.oldPrice
?

Number(data.oldPrice)

:

null;

const packQty=
data.packQty || "";

const fewStock=
data.fewStock || false;


productsDiv.innerHTML+=`

<div
class="card"
onclick="openProduct('${doc.id}')"
>

${fewStock ?

`<div class="stock-badge">

Few Stock

</div>`

:

""

}

<img
src="${data.Image || 'logo.png'}"
onerror="
this.src='logo.png'
">

<h3>

${data.name || "No Name"}

</h3>

${packQty ?

`

<div class="pack">

📦 ${packQty}

</div>

`

:

""

}

<div class="price-box">

${

oldPrice

?

`

<span class="old-price">

₹${oldPrice}

</span>

`

:

""

}

<span class="new-price">

₹${realPrice}

</span>

</div>

<button
class="btn"
onclick="
event.stopPropagation()
">

🛒 Add Cart

</button>

</div>

`;

});

}

catch(error){

console.log(error);

productsDiv.innerHTML=`

<h3 style="
text-align:center;
padding:20px;
color:red;
">

Error Loading Products

</h3>

`;

}

}



/* Product Page */

window.openProduct=(id)=>{

window.location=
`product-details.html?id=${id}`;

};



/* Login/Profile Check */

if(profileNav){

onAuthStateChanged(

auth,

(user)=>{

if(user){

profileNav.href=
"profile.html";

profileNav.innerHTML=
"👤<br>Yours";

}

else{

profileNav.href=
"login.html";

profileNav.innerHTML=
"🔐<br>Login";

}

}

);

}



/* Category Click */

categoryCards.forEach(

(card)=>{

card.onclick=()=>{

const category=
card.innerText
.replace(/[🍫🥑🥔🌿]/g,"")
.trim();

window.location=

`products.html?category=${encodeURIComponent(category)}`;

};

}

);



/* Search */

if(searchInput){

searchInput.addEventListener(

"keypress",

(event)=>{

if(event.key==="Enter"){

const search=
searchInput.value.trim();

if(search){

window.location=

`products.html?search=${encodeURIComponent(search)}`;

}

}

}

);

}



/* Start */

loadProducts();



const aboutLink = document.getElementById("aboutLink");

if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
        e.preventDefault(); // Prevents default anchor behavior if necessary
        window.location.href = "about.html";
    });
}
