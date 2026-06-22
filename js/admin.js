import { auth, db }
from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
getCountFromServer,
updateDoc
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

const ordersDiv=
document.getElementById(
"allOrders"
);

let selectedOrderId=null;


/* Admin authentication */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location=
"admin-login.html";

return;

}

if(
user.email !==
"kodaihillsspot@gmail.com"
){

alert(
"Access Denied"
);

window.location=
"index.html";

return;

}

loadStats();
loadProducts();
loadOrders();

}

);


/* Add Product */

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


if(
!name ||
!price ||
!image ||
!description
){

alert(
"Fill all fields"
);

return;

}

await addDoc(

collection(
db,
"Products"
),

{

name,
price,
category,
Image:image,
description

}

);

alert(
"Product Added Successfully"
);


/* Clear form */

name.value="";
price.value="";
image.value="";
description.value="";


loadProducts();
loadStats();

}

catch(error){

alert(
error.message
);

}

};


/* Product list */

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

productsDiv.innerHTML +=`

<div class="product">

<img
src="${data.Image}"
style="
width:100%;
height:150px;
object-fit:cover;
border-radius:10px;">

<h3>

${data.name}

</h3>

<p>

₹${data.price}

</p>

<p>

${data.category}

</p>

<button
onclick="deleteProduct('${item.id}')"
style="
background:red;
color:white;
border:none;
padding:10px;
border-radius:10px;">

Delete

</button>

</div>

`;

});

}


/* Delete product */

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


/* Dashboard stats */

async function loadStats(){

const productCount=

await getCountFromServer(

collection(
db,
"Products"
)

);

const orderCount=

await getCountFromServer(

collection(
db,
"Orders"
)

);

document.getElementById(
"totalProducts"
)

.innerText=

productCount.data().count;


document.getElementById(
"totalOrders"
)

.innerText=

orderCount.data().count;

}


/* User page button */

document.getElementById(
"userBtn"
)

.onclick=()=>{

window.location=
"srkxditit.html";

};


/* Orders */

async function loadOrders(){

ordersDiv.innerHTML="";

const snapshot=

await getDocs(

collection(
db,
"Orders"
)

);

snapshot.forEach((item)=>{

const data=
item.data();

ordersDiv.innerHTML+=`

<div class="product"
onclick="openPopup('${item.id}')">

<h3>

${data.name}

</h3>

<p>

${data.email||""}

</p>

<p>

₹${data.price}

</p>

<p>

Status:
${data.status||"Pending"}

</p>

</div>

`;

});

}


/* Popup */

window.openPopup=
(id)=>{

selectedOrderId=id;

document.getElementById(
"statusPopup"
)

.style.display=
"flex";

};


window.closePopup=
()=>{

document.getElementById(
"statusPopup"
)

.style.display=
"none";

};


statusSelect.onchange=()=>{

trackingId.style.display=

statusSelect.value==="Approved"

?

"block"

:

"none";

};


updateBtn.onclick=

async()=>{

const status=
statusSelect.value;

const tracking=
trackingId.value;

await updateDoc(

doc(
db,
"Orders",
selectedOrderId
),

{

status:status,

trackingId:

status==="Approved"

?

tracking

:

""

}

);

alert(
"Updated Successfully"
);

closePopup();

loadOrders();

};