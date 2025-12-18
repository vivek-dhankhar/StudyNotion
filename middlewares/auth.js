
const jwt = require("jsonwebtoken");
require("dotenv").config();

//auth middleware ------------------------------------
exports.auth=async(req,res,next)=>{
   try {
     //find token from the header or cookie
    const token = req.body.token ||req.cookies.token || req.header("Authorization").replace("Bearer ", "")
    console.log(token);
    if(!token){
        return res.status(400).json({success:false,message:"token not found "})
    }
    //token verify  
        const decode = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decode;
        next();
 
   } catch (error) {
     console.log(error)
        return res.status(401).json({success:false, message:"invalid token"})
   }
}

//isStudent middleware-----------------------------------------------------------------------------
exports.isStudent=async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Student"){
            return res.status(400).json({success:false, message:"this is procted route for student only"})
        }
        next();
    } catch (error) {
        return res.status(500).json({success:false, message:"user role cannot be verifed , try again"})
    }
}

//isAdmin middleware-------------------------------------------------------------------------
exports.isAdmin=async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(400).json({success:false, message:"this is procted route for admin only"})
        }
        next();
    } catch (error) {
        return res.status(500).json({success:false, message:"user role cannot be verifed , try again"})
    }
}
//isInstructor middleware---------------------------------------------------------------------
exports.isInstructor=async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(400).json({success:false, message:"this is procted route for Instructor only"})
        }
        next();
    } catch (error) {
        return res.status(500).json({success:false, message:"user role cannot be verifed , try again"})
    }
}