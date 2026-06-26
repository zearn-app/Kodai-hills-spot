import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
getCountFromServer
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productsDiv=
document.getElementById("products");

const ordersDiv=
document.getElementById("allOrders");

let selectedOrderId=null;


/* Quantity variant elements */

const enableVariants=
document.getElementById(
"enableVariants"
);

const variantSection=
document.getElementById(
"variantSection"
);

const variantFields=
document.getElementById(
"variantFields"
);

const addVariantBtn=
document.getElementById(
"addVariantBtn"
);


/* Toggle quantity options */

enableVariants.onchange=()=>{

if(enableVariants.checked){

variantSection.style.display=
"block";

document.getElementById(
"packQty"
).style.display=
"none";

}

else{

variantSection.style.display=
"none";

document.getElementById(
"packQty"
).style.display=
"block";

variantFields.innerHTML="";

}

};



/* Add quantity field */

addVariantBtn.onclick=()=>{

const div=
document.createElement(
"div"
);

div.innerHTML=`

<input
class="variantInput"
placeholder="Example: 500g / 1kg / 2L"
style="
margin-top:10px;
width:100%;
padding:12px;
border-radius:10px;
">

`;

variantFields.appendChild(
div
);

};



/* ADMIN LOGIN CHECK */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"index.html";

return;

}

if(

user.email!=="kodaihillsspot@gmail.com"

){

alert(
"Access denied"
);

window.location=
"home.html";

return;

}

loadStats();

loadProducts();

loadOrders();

}

);



document.getElementById(
"userBtn"
).onclick=()=>{

window.location=
"srkxditit.html";

};



/* ADD PRODUCT */

document.getElementById(
"addBtn"
).onclick=

async()=>{

try{

const name=
document.getElementById(
"name"
).value.trim();

const price=
document.getElementById(
"price"
).value.trim();

const oldPrice=
document.getElementById(
"oldPrice"
).value.trim();

const packQty=
document.getElementById(
"packQty"
).value.trim();

const category=
document.getElementById(
"category"
).value;

const image=
document.getElementById(
"image"
).value.trim();

const description=
document.getElementById(
"description"
).value.trim();

const fewStock=
document.getElementById(
"fewStock"
).checked;


if(

!name||
!price||
!image||
!description

){

alert(
"Fill all fields"
);

return;

}


/* Get quantity variants */

let quantityVariants=[];

document
.querySelectorAll(
".variantInput"
)
.forEach((item)=>{

if(item.value.trim()){

quantityVariants.push(
item.value.trim()
);

}

});


await addDoc(

collection(
db,
"Products"
),

{

name:name,
price:price,
oldPrice:oldPrice,

packQty:

enableVariants.checked

?

""

:

packQty,

quantityVariants:
quantityVariants,

category:category,

Image:image,

description:description,

fewStock:fewStock

}

);


alert(
"Product Added Successfully"
);


/* Clear fields */

document.getElementById(
"name"
).value="";

document.getElementById(
"price"
).value="";

document.getElementById(
"oldPrice"
).value="";

document.getElementById(
"packQty"
).value="";

document.getElementById(
"image"
).value="";

document.getElementById(
"description"
).value="";

document.getElementById(
"fewStock"
).checked=false;

document.getElementById(
"enableVariants"
).checked=false;

variantFields.innerHTML="";

variantSection.style.display=
"none";

document.getElementById(
"packQty"
).style.display=
"block";

loadProducts();

loadStats();

}

catch(error){

alert(
error.message
);

console.log(
error
);

}

};



/* LOAD PRODUCTS */

async function loadProducts(){

productsDiv.innerHTML=
"Loading...";

const snapshot=
await getDocs(
collection(
db,
"Products"
)
);

productsDiv.innerHTML="";

snapshot.forEach((item)=>{

const data=
item.data();

let quantityDisplay="";

if(

data.quantityVariants &&
data.quantityVariants.length>0

){

quantityDisplay=

data.quantityVariants
.map(q=>`

<span style="
display:inline-block;
padding:5px 10px;
background:#f5f5f5;
margin:4px;
border-radius:10px;
">

${q}

</span>

`)
.join("");

}

else{

quantityDisplay=
data.packQty||"-";

}


productsDiv.innerHTML+=`

<div style="
background:white;
padding:15px;
margin-bottom:15px;
border-radius:15px;
">

<img
src="${data.Image}"
style="
width:100%;
height:150px;
object-fit:cover;
border-radius:10px;
">

<h3>
${data.name}
</h3>

<p>
Price: ₹${data.price}
</p>

<p>
Quantity:
<br>
${quantityDisplay}
</p>

<p>
${data.category}
</p>

${

data.fewStock

?

"<p style='color:red'>⚠ Few Stock Left</p>"

:

""

}

<button
onclick="deleteProduct('${item.id}')"
style="
background:red;
color:white;
padding:10px;
border:none;
border-radius:10px;
">

Delete

</button>

</div>

`;

});

}



/* DELETE PRODUCT */

window.deleteProduct=

async(id)=>{

await deleteDoc(

doc(
db,
"Products",
id
)

);

loadProducts();

loadStats();

};



/* LOAD STATS */

async function loadStats(){

const products=

await getCountFromServer(
collection(
db,
"Products"
)
);

const orders=

await getCountFromServer(
collection(
db,
"Orders"
)
);

document.getElementById(
"totalProducts"
).innerText=
products.data().count;

document.getElementById(
"totalOrders"
).innerText=
orders.data().count;

}



/* LOAD ORDERS */

async function loadOrders(){

ordersDiv.innerHTML=
"Loading...";

const snapshot=

await getDocs(
collection(
db,
"Orders"
)
);

ordersDiv.innerHTML="";

snapshot.forEach((item)=>{

const data=
item.data();

ordersDiv.innerHTML+=`

<div
onclick='openOrder(${JSON.stringify({
id:item.id,
...data
})})'

style="
background:white;
padding:15px;
margin-bottom:15px;
border-radius:15px;
cursor:pointer;
">

<h3>
${data.name||"-"}
</h3>

<p>
₹${data.price||0}
</p>

<p>
Status:
${data.status||"Pending"}
</p>

</div>

`;

});

}