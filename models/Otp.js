const mongoose = require("mongoose")
const mailSender = require("../utils/mailSender")

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
})

//function -> to send email
const sendVerificationEmail=async(email, otp)=>{
    try {
        const mailResponse = mailSender(email , "Verification email from StudyNotion",otp);
        console.log('email sent sucessfully',mailResponse)
    } 
    catch (error) {
        console.log("error occured while sending mail" , error)
    }
}

 otpSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email , this.otp);
    next();
 })

module.exports = mongoose.model("Otp" , otpSchema)