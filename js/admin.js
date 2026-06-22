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
document.getElementById("products");

const ordersDiv=
document.getElementById("allOrders");

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

alert("Access Denied");

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


/* Input elements */

const nameInput=
document.getElementById(
"name"
);

const priceInput=
document.getElementById(
"price"
);

const categoryInput=
document.getElementById(
"category"
);

const imageInput=
document.getElementById(
"image"
);

const descriptionInput=
document.getElementById(
"description"
);


/* Values */

const name=
nameInput.value.trim();

const price=
priceInput.value.trim();

const category=
categoryInput.value;

const image=
imageInput.value.trim();

const description=
descriptionInput.value.trim();


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


/* Add to Firebase */

await addDoc(

collection(
db,
"Products"
),

{

name:name,

price:price,

category:category,

Image:image,

description:description

}

);


alert(
"Product Added Successfully"
);


/* Clear fields */

nameInput.value="";

priceInput.value="";

categoryInput.selectedIndex=0;

imageInput.value="";

descriptionInput.value="";


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


productsDiv.innerHTML+=`

<div class="product">

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

${data.category}

</p>

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


/* Delete Product */

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


/* Dashboard Stats */

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


/* User page */

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

<div
class="product"
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
${data.status || "Pending"}

</p>

</div>

`;

});

}


/* Popup */

window.openPopup=
(id)=>{

selectedOrderId=id;

statusPopup.style.display=
"flex";

};


window.closePopup=
()=>{

statusPopup.style.display=
"none";

};


statusSelect.onchange=
()=>{

trackingId.style.display=

statusSelect.value==="Approved"

?

"block"

:

"none";

};


updateBtn.onclick=

async()=>{

await updateDoc(

doc(
db,
"Orders",
selectedOrderId
),

{

status:
statusSelect.value,

trackingId:

statusSelect.value==="Approved"

?

trackingId.value

:

""

}

);

alert(
"Status Updated"
);

closePopup();

loadOrders();

};