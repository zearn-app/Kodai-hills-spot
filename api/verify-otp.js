import twilio from "twilio";

const client=twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req,res){

try{

let {phone,otp}=req.body;

phone=phone.trim();

if(!phone.startsWith("+91")){

phone="+91"+phone;

}

const result=
await client.verify.v2
.services(
process.env.VERIFY_SERVICE
)
.verificationChecks
.create({

to:phone,
code:otp

});

return res.status(200).json({

verified:
result.status==="approved"

});

}
catch(error){

return res.status(500).json({

verified:false,
message:error.message

});

}

}