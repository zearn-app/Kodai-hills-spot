const stateSelect=
document.getElementById(
"state"
);

const districtSelect=
document.getElementById(
"district"
);


const statesAndDistricts={

"Andhra Pradesh":[
"Anantapur",
"Chittoor",
"Guntur",
"Kadapa",
"Krishna",
"Kurnool",
"Nellore",
"Prakasam",
"Srikakulam",
"Visakhapatnam",
"Vizianagaram"
],

"Arunachal Pradesh":[
"Itanagar",
"Tawang",
"West Siang"
],

"Assam":[
"Guwahati",
"Dibrugarh",
"Silchar",
"Nagaon"
],

"Bihar":[
"Patna",
"Gaya",
"Muzaffarpur",
"Bhagalpur"
],

"Chhattisgarh":[
"Raipur",
"Bilaspur",
"Durg"
],

"Goa":[
"North Goa",
"South Goa"
],

"Gujarat":[
"Ahmedabad",
"Surat",
"Rajkot",
"Vadodara"
],

"Haryana":[
"Gurgaon",
"Faridabad",
"Panipat"
],

"Himachal Pradesh":[
"Shimla",
"Kullu",
"Manali"
],

"Jharkhand":[
"Ranchi",
"Jamshedpur",
"Dhanbad"
],

"Karnataka":[
"Bangalore",
"Mysore",
"Mangalore",
"Hubli"
],

"Kerala":[
"Thiruvananthapuram",
"Kochi",
"Kozhikode",
"Kollam"
],

"Madhya Pradesh":[
"Bhopal",
"Indore",
"Gwalior"
],

"Maharashtra":[
"Mumbai",
"Pune",
"Nagpur",
"Nashik"
],

"Manipur":[
"Imphal"
],

"Meghalaya":[
"Shillong"
],

"Mizoram":[
"Aizawl"
],

"Nagaland":[
"Kohima"
],

"Odisha":[
"Bhubaneswar",
"Cuttack",
"Puri"
],

"Punjab":[
"Amritsar",
"Ludhiana",
"Jalandhar"
],

"Rajasthan":[
"Jaipur",
"Jodhpur",
"Udaipur"
],

"Sikkim":[
"Gangtok"
],

"Tamil Nadu":[
"Chennai",
"Coimbatore",
"Madurai",
"Tirunelveli",
"Salem",
"Tiruppur",
"Erode",
"Trichy",
"Kanyakumari",
"Dindigul",
"Thanjavur"
],

"Telangana":[
"Hyderabad",
"Warangal",
"Karimnagar"
],

"Tripura":[
"Agartala"
],

"Uttar Pradesh":[
"Lucknow",
"Kanpur",
"Agra",
"Varanasi"
],

"Uttarakhand":[
"Dehradun",
"Haridwar"
],

"West Bengal":[
"Kolkata",
"Howrah",
"Darjeeling"
]

};


/* Load States */

Object.keys(
statesAndDistricts
)

.forEach(state=>{

stateSelect.innerHTML+=`

<option>

${state}

</option>

`;

});


/* Load Districts */

stateSelect.addEventListener(

"change",

()=>{

districtSelect.innerHTML=`

<option value="">

Select District

</option>

`;

const districts=

statesAndDistricts[
stateSelect.value
];

districts.forEach(

district=>{

districtSelect.innerHTML+=`

<option>

${district}

</option>

`;

}

);

}

);