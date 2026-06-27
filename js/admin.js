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
updateDoc,
doc,
getCountFromServer
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const productsDiv=
document.getElementById("products");

const ordersDiv=
document.getElementById("allOrders");

const enableVariants=
document.getElementById("enableVariants");

const variantSection=
document.getElementById("variantSection");

const variantFields=
document.getElementById("variantFields");

const addVariantBtn=
document.getElementById("addVariantBtn");


/* ------------------------------
Quantity Toggle
--------------------------------*/

enableVariants.onchange=()=>{

if(enableVariants.checked){

variantSection.style.display=
"block";

document.getElementById(
"packQty"
).style.display="none";

}else{

variantSection.style.display=
"none";

document.getElementById(
"packQty"
).style.display=
"block";

variantFields.innerHTML="";

}

};



/* ------------------------------
Add Quantity Button
--------------------------------*/

addVariantBtn.onclick=()=>{

const div=
document.createElement(
"div"
);

div.style.marginBottom=
"10px";

div.innerHTML=`

<div style="
display:flex;
gap:10px;
margin-bottom:10px;
">

<input
class="variantQty"
placeholder="500g / 1kg"
style="flex:1"
>

<input
class="variantPrice"
placeholder="Price"
type="number"
style="flex:1"
>

<button
class="removeVariant"
style="
width:60px;
background:red;
color:white;
border:none;
border-radius:10px;
">

✖

</button>

</div>

`;

variantFields.appendChild(
div
);


/* Remove variant */

div.querySelector(
".removeVariant"
)

.onclick=()=>{

div.remove();

};

};



/* ------------------------------
Admin Login Check
--------------------------------*/

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



/* ------------------------------
Add Product
--------------------------------*/

document.getElementById(
"addBtn"
)

.onclick=

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


/* Get Variants */

let quantityVariants=[];

const qtyInputs=

document.querySelectorAll(
".variantQty"
);

const priceInputs=

document.querySelectorAll(
".variantPrice"
);


for(

let i=0;

i<qtyInputs.length;

i++

){

const qty=

qtyInputs[i]
.value.trim();

const price=

priceInputs[i]
.value.trim();

if(qty&&price){

quantityVariants.push({

qty:qty,

price:Number(
price
)

});

}

}


await addDoc(

collection(
db,
"Products"
),

{

name:name,

price:Number(
price
),

oldPrice:

oldPrice

?

Number(
oldPrice
)

:

null,

packQty:

enableVariants.checked

?

""

:

packQty,

quantityVariants:
quantityVariants,

category:
category,

Image:
image,

description:
description,

fewStock:
fewStock

}

);

alert(
"Product Added Successfully"
);


/* Clear */

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

enableVariants.checked=
false;

variantFields.innerHTML=
"";

variantSection.style.display=
"none";

loadProducts();

loadStats();

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



/* ------------------------------
Load Products
--------------------------------*/

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

productsDiv.innerHTML=
"";


snapshot.forEach(

(item)=>{

const data=
item.data();

let quantityDisplay=
"";

if(

data.quantityVariants &&

data.quantityVariants.length>0

){

quantityDisplay=

data.quantityVariants

.map(

q=>`

<span style="
display:inline-block;
padding:5px 10px;
background:#f5f5f5;
margin:4px;
border-radius:10px;
">

${q.qty}
- ₹${q.price}

</span>

`

)

.join("");

}else{

quantityDisplay=

data.packQty || "-";

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

₹${data.price}

</p>

<p>

${quantityDisplay}

</p>

<button
onclick="editProduct('${item.id}')"
style="
background:#2196f3;
color:white;
padding:10px;
border:none;
border-radius:10px;
margin-right:10px;
">

Edit

</button>

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

}

);

}



/* Delete */

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



let currentEditId="";


window.editProduct=

async(id)=>{

currentEditId=id;

const snapshot=

await getDocs(
collection(db,"Products")
);

snapshot.forEach((item)=>{

if(item.id===id){

const data=item.data();

document.getElementById(
"editName"
).value=data.name||"";

document.getElementById(
"editPrice"
).value=data.price||"";

document.getElementById(
"editOldPrice"
).value=data.oldPrice||"";

document.getElementById(
"editPackQty"
).value=data.packQty||"";

document.getElementById(
"editImage"
).value=data.Image||"";

document.getElementById(
"editDescription"
).value=
data.description||"";

}

});

document.getElementById(
"editPopup"
).style.display=
"flex";

};


window.closeEdit=()=>{

document.getElementById(
"editPopup"
).style.display=
"none";

};


document.getElementById(
"saveEditBtn"
)

.onclick=

async()=>{

try{

await updateDoc(

doc(
db,
"Products",
currentEditId
),

{

name:

document.getElementById(
"editName"
).value,

price:Number(

document.getElementById(
"editPrice"
).value
),

oldPrice:Number(

document.getElementById(
"editOldPrice"
).value
),

packQty:

document.getElementById(
"editPackQty"
).value,

Image:

document.getElementById(
"editImage"
).value,

description:

document.getElementById(
"editDescription"
).value

}

);

alert(
"Product Updated Successfully"
);

closeEdit();

loadProducts();

}
catch(error){

alert(
error.message
);

}

};

/* Stats */

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


/* Orders */

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

ordersDiv.innerHTML=
"";

snapshot.forEach(

(item)=>{

const data=
item.data();

ordersDiv.innerHTML+=`

<div style="
background:white;
padding:15px;
margin-bottom:10px;
border-radius:10px;
">

<h3>

${data.name}

</h3>

<p>

₹${data.price}

</p>

</div>

`;

}

);

}