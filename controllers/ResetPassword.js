const User = require('../models/User');
const mailSender = require("../utils/mailSender")


//ResetPassword Token------------------------------------------------------------------
exports.resetPasswordToken=async(req,res)=>{
    try{
        //get email from req body
        const {email} = req.body
        //check email in db and validate
        const user = await User.findOne({email:email})
        if(!user){
            return res.status(400).json({success:false, message:"not a valid email address"})
        }
        //generate token 
        const token = crypto.randomUUID()
        //update user by token and expiry time 
        const updateDetails = await User.findOneAndUpdate({email:email}, 
                                                           {token:token ,
                                                            resetPasswordExpires: Date.now() + 5*60*1000
                                                           },
                                                           {new:true})
        //create url
        const url = `http://localhost:3000/update-password/${token}`
        //send mail 
        await mailSender(email , "reset password link" , `reset password link :  ${url}`)
        //send response
        return res.status(200).json({success:true, message:"reset password link send sucessfully"})
    }
    catch(error){
        return res.status(500).json({success:false, message:"something went wrong while sending reset password link"})
    }
}

//ResetPassword-----------------------------------------------------------------------------
exports.resetPassword=async(req,res)=>{
    try{
        //fetch the data 
        const {password , confirmPassword , token } = req.body ;
        //validate it 
        if(password !== confirmPassword){
            return res.status(400).json({success:false, message:"password not matching"})
        }
        //get user detail from db using token
        const userDetails = await User.findOne({token:token})
        //if no entry invalid token
        if(!token){
            return res.status(401).json({success:false,message:"invalid token"})
        }
        //token time check
        if(userDetails.resetPasswordExpires < Date.now){
            return res.status({success:false, message:"token expired"})
        }
        // hash pass
        const hashedPassword = await bcrypt.hash(password , 10)
        //update pass 
        await User.findOneAndUpdate({token:token } , {password:hashedPassword}, {new:true})
        //return response
        return res.status(200).json({success:true, message:"password reset successfully"})
    }
    catch(error){
        return res.status(500).json({success:false, message:"error in reseting password , try again"})
    }
}