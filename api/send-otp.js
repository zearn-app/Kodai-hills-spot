import twilio from "twilio";

const client=twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH
);

export default async function handler(req,res){

try{

const {phone}=req.body;

if(!phone){
return res.status(400).json({

success:false,
message:"Phone number missing"

});

}

await client.verify.v2
.services(
process.env.VERIFY_SERVICE
)
.verifications
.create({

to:"+91"+phone,
channel:"sms"

});

return res.status(200).json({

success:true,
message:"OTP Sent"

});

}
catch(error){

console.log(error);

return res.status(500).json({

success:false,
message:error.message

});

}

}