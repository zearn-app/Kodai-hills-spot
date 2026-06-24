import {auth}
from "./js/firebase.js";

document
.getElementById(
"checkoutBtn"
)

.onclick=()=>{

if(!auth.currentUser){

window.location=
"login.html";

return;

}

const firstProduct=
document.querySelector(
".card"
);

if(!firstProduct){

alert(
"Cart Empty"
);

return;

}

const productId=
firstProduct.dataset.id;

window.location=
`checkout.html?id=${productId}`;

};