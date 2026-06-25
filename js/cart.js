<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>Kodai Hills Spot - Cart</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial,sans-serif;
}

body{
background:#f5f5f5;
padding-bottom:90px;
}

.navbar{
background:white;
padding:15px;
display:flex;
justify-content:space-between;
align-items:center;
position:sticky;
top:0;
box-shadow:0 2px 10px rgba(0,0,0,.1);
}

.logo-box{
display:flex;
align-items:center;
gap:10px;
}

.logo{
width:45px;
height:45px;
border-radius:50%;
object-fit:cover;
border:2px solid #2e7d32;
}

.logo-text{
font-size:22px;
font-weight:bold;
color:#2e7d32;
}

.cart-header{
padding:20px;
font-size:25px;
font-weight:bold;
}

#cartItems{
padding:15px;
}

.card{
background:white;
padding:15px;
margin-bottom:15px;
border-radius:15px;
display:flex;
gap:15px;
box-shadow:0 2px 10px rgba(0,0,0,.1);
}

.card img{
width:100px;
height:100px;
border-radius:10px;
object-fit:cover;
}

.details{
flex:1;
}

.price{
color:#2e7d32;
font-weight:bold;
margin:8px 0;
}

.remove{
padding:8px 15px;
border:none;
border-radius:8px;
background:#e53935;
color:white;
}

.summary{
position:fixed;
bottom:75px;
left:0;
width:100%;
background:white;
padding:15px;
box-shadow:0 -2px 10px rgba(0,0,0,.1);
}

.total{
font-size:22px;
font-weight:bold;
color:#2e7d32;
margin-bottom:10px;
}

.checkout{
width:100%;
padding:14px;
border:none;
border-radius:12px;
background:#2e7d32;
color:white;
font-size:17px;
cursor:pointer;
}

.bottom-nav{
position:fixed;
bottom:0;
left:0;
width:100%;
background:white;
display:flex;
justify-content:space-around;
padding:15px;
box-shadow:0 -2px 10px rgba(0,0,0,.1);
}

.bottom-nav a{
text-decoration:none;
color:black;
font-size:14px;
text-align:center;
}

.active{
color:#2e7d32;
font-weight:bold;
}

</style>
</head>

<body>

<nav class="navbar">

<div class="logo-box">

<img src="logo.png" class="logo">

<div class="logo-text">
Kodai Hills Spot
</div>

</div>

</nav>


<div class="cart-header">

🛒 My Cart

</div>


<div id="cartItems">

</div>


<div class="summary">

<div class="total" id="total">

Total : ₹0

</div>

<button
class="checkout"
id="checkoutBtn">

Proceed To Checkout

</button>

</div>


<nav class="bottom-nav">

<a href="index.html">
🏠<br>Home
</a>

<a href="products.html">
🛍️<br>Products
</a>

<a href="cart.html" class="active">
🛒<br>Cart
</a>

<a href="profile.html">
👤<br>Profile
</a>

</nav>

<script type="module">

import {auth,db}
from "./js/firebase.js";

import {
collection,
query,
where,
getDocs,
deleteDoc,
doc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const cartItems=
document.getElementById(
"cartItems"
);

const totalDiv=
document.getElementById(
"total"
);

let firstProductId="";


async function loadCart(){

const user=auth.currentUser;

if(!user){
window.location="login.html";
return;
}

cartItems.innerHTML=
"Loading...";

const q=query(
collection(db,"Cart"),
where(
"uid",
"==",
user.uid
)
);

const snapshot=
await getDocs(q);

cartItems.innerHTML="";

let total=0;

if(snapshot.empty){

cartItems.innerHTML=`

<h2 style="
text-align:center;
margin-top:50px;
">

Cart Empty

</h2>

`;

return;
}

snapshot.forEach((itemDoc)=>{

const item=itemDoc.data();

if(!firstProductId){

firstProductId=
item.productId;
}

total+=
Number(item.price);

cartItems.innerHTML+=`

<div 
class="card"
data-id="${item.productId}"
>

<img
src="${item.image}"
onerror="
this.src='logo.png'
">

<div class="details">

<h3>

${item.name}

</h3>

<div class="price">

₹${item.price}

</div>

<p>

Qty : 
${item.quantity||1}

</p>

<button
class="remove"
onclick="
removeItem(
'${itemDoc.id}'
)
">

Remove

</button>

</div>

</div>

`;

});

totalDiv.innerText=
`Total : ₹${total}`;

}


/* Remove Item */

window.removeItem=
async(id)=>{

await deleteDoc(
doc(
db,
"Cart",
id
)
);

loadCart();

};


/* Auth Check */

auth.onAuthStateChanged(

(user)=>{

if(user){

loadCart();

}

else{

window.location=
"login.html";

}

});


/* Checkout */

document
.getElementById(
"checkoutBtn"
)

.onclick=()=>{

if(!firstProductId){

alert(
"Cart Empty"
);

return;
}

window.location=
`checkout.html?id=${firstProductId}`;

};

</script>
</body>
</html>