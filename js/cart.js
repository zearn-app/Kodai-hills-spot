const cartItems=

document.getElementById(
"cartItems"
);

const totalDiv=
document.getElementById(
"total"
);


let cart=

JSON.parse(

localStorage.getItem(
"cart"
)

)||[];


function loadCart(){

cartItems.innerHTML="";

let total=0;


if(cart.length===0){

cartItems.innerHTML=`

<h2>

Cart Empty

</h2>

`;

return;

}


cart.forEach((item,index)=>{

total +=

item.price*
item.quantity;


cartItems.innerHTML +=`

<div class="card"

onclick="window.location='product-details.html?id=${item.productId}'"

style="cursor:pointer">

<img src="${item.image}">

<div class="details">

<h3>

${item.name}

</h3>

<div class="price">

₹${item.price}

</div>

<p>

Quantity :
${item.quantity}

</p>

<button
class="remove"

onclick="event.stopPropagation();
removeItem(${index})">

Remove

</button>

</div>

</div>

`;

});


totalDiv.innerText=

"Total : ₹"+total;

}


window.removeItem=
(index)=>{

cart.splice(
index,
1
);

localStorage.setItem(

"cart",

JSON.stringify(
cart
)

);

loadCart();

};


loadCart();