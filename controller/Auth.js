const User = require('../models/User');
const OTP = require('../models/Otp')
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
require("dotenv").config();

//otp controller------------------------------------------------------------
exports.sendOTP = async(req,res)=>{
    try {
        const {email} = req.body;
        
        const emailExists = User.findOne({email})

        if(emailExists){
            return res.status(401).json({sucess:false , message:";user already exists"})
        }
    
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })

        console.log('otp generated', otp)

        const result = await OTP.findOne({otp:otp})

        while(result){
            otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
         } ) 
         result = await OTP.findOne({otp:otp})
        }

        const otpBody = await OTP.create({email, otp})

        console.log(otpBody)
        
        return res.status(200).json({sucess:true , message:"otp send sucessfully"})

    } catch (error) {
        console.log("error in sending otp" , error)
        return res.status(500).json({sucess:false, message:"error in sending otp"})
    }
}

// singnUp controller--------------------------------------------------------------
exports.signUp=async(req,res)=>{
    try {
        //data fetch from req body
    const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp} = req.body;
    //validate kro 
    if(!firstName|| !lastName||!email||!password||!confirmPassword||!accountType||!contactNumber||!otp){
        return res.status(403).json({sucess:false , message:"enter all details"})
    }
    //2 password match karlo
    if(password!=confirmPassword){
        return res.status(400).json({sucess:false, message:"password does not match , Try Again"})
    }
    //check user already exists
    const userExists = await User.findOne({email})
    if(userExist){
        return res.status(400).json({sucess:false, message:"User already exists"})
    }
    //find most recent otp from the db 
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    //validate otp 
    if(recentOtp.length == 0){
        return res.status(400).json({sucess:false,message:"otp not found"})
    }
    if(otp !== recentOtp.otp){
        return res.status(400).json({sucess:false, message:"invalid otp"})
    }
    //hash the password 
    const hashedPassword = await bcrypt.hash(password, 10);
    //make an entry in db 
    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null
    })
    
    const user = await User.create({
        firstName,
        lastName,
        email,
        password:hashedPassword,
        accountType,
        contactNumber,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })
    //return res
    return res.status(200).json({sucess:true, message:"User registered sucessfully"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({sucess:false,message:"user cannot be registered , Please try again"})
    }
}

//signIN controller------------------------------------
exports.signIn=async(req,res)=>{
    try {
        //get email and pass from body
        const {email , password}= req.body;
        //validate that or not empty 
        if(!email || !password){
            return res.status(403).json({sucess:false, message:"enter all details"})
        }
        //find email in db
        const user = awaitUser.findOne({email}).populate("additionalDetails")
        //if not exist throw error 
        if(!user){
            return res.status(402).json({sucess:false, message:"user does not exists , please signup"})
        }
        //match the password
        const compare = await bcrypt.compare(password , user.password)
        if(!compare){
            return res.status(400).json({sucess:false,message:"incorrect password"})
        }
        //create a jwt
        const payload = {id:user._id ,email:user.email, accountType:user.accountType }
        const options = {expires:"3d"}
        const token = jwt.sign(payload, process.env.SECRET_KEY,options)

        user.token = token ;
        user.password = undefined ; 
        
        //set a cookie and insert token into cookie 
        res.cookie("token",token , {secure:true,httpOnly:true,maxAge:3*24*60*60*1000}).status(200).json({sucess:true,message:"LoggedIn successfully" , token , user })
        //successfull response 

    } catch (error) {
        console.log(error)
        res.status(500).json({sucess:false,message:"login failed , please try again"})
    }
}

//Forget Password-------------------------------------------------------