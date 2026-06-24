import twilio from "twilio";

export default async function handler(req,res){

try{

const client=twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH_TOKEN
);

let {phone}=req.body;

phone=phone.trim();

if(!phone.startsWith("+91")){
phone="+91"+phone;
}

console.log(
"SID exists:",
!!process.env.TWILIO_SID
);

console.log(
"Verify exists:",
!!process.env.VERIFY_SERVICE
);

const result=
await client.verify.v2
.services(
process.env.VERIFY_SERVICE
)
.verifications.create({

to:phone,
channel:"sms"

});

return res.status(200).json({

success:true,
message:"OTP sent"

});

}
catch(error){

console.log(
"Full Error:",
error
);

return res.status(500).json({

success:false,
message:error.message,
code:error.code

});

}

}