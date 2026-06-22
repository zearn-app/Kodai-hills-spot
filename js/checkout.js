let cart=
JSON.parse(
localStorage.getItem("cart")
)||[];


let total=0;

cart.forEach(item=>{

total +=
Number(item.price);

});

document.getElementById(
"total"
).innerText=
"Total : ₹"+total;



document.getElementById(
"whatsappBtn"
)

.onclick=()=>{

let name=
document.getElementById(
"customerName"
).value;

let phone=
document.getElementById(
"customerPhone"
).value;

let address=
document.getElementById(
"customerAddress"
).value;


let message=

`New Order

Name: ${name}

Phone: ${phone}

Address: ${address}

Total: ₹${total}
`;


window.open(

`https://wa.me/91YOURNUMBER?text=${encodeURIComponent(message)}`

);

};



document.getElementById(
"placeOrder"
)

.onclick=()=>{

alert(
"Order placed successfully"
);

};