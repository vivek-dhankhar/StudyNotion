const Profile = require("../models/Profile")
const User = require("../models/User")

//directly update profile bcz during singUp we have already created profile-------------
exports.updateProfile=async(req,res)=>{
    try {
        //get data
        const {gender,dateOfBirth="",about="",contactNumber} =  req.body
        //get userid
        const userId = req.user.id
        //validate
        if(!gender || !contactNumber || !userId){
            return res.status(400).json({success:false,message:"all fields required"})
        }
        //get profileId
        const userDetails = await User.findById(userId)
        const profileId = userDetails.additionalDetails
        const profileDetails = await Profile.findById(profileId)
        //update profile 
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about ;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        //return response
        return res.status(200).json({success:true,message:"profile updated sucessfully"})
    } catch (error) {
        return res.status(500).json({success:false,message:"profile update failed , try again"})
    }
}

//deleteAccount ------------------------------------------------------------
exports.deleteAccount=async(req,res)=>{
    try {
        //get userId
        const userId = req.user.id
        //get profileID and validate
        const userDetails = await User.findById(userId)
        if(!userDetails){
            return res.status(404).json({success:false,message:"user not found"})
        }
        //delete profile 
        await Profile.findByIdAndDelete(userDetails.additionalDetails);
        //delete user 
        await User.findByIdAndDelete(userId);
        //return response
        return res.status(200).json({success:true,message:"account deleted sucessfully"})
    } catch (error) {
        return res.status(500).json({success:false,message:"account cannot deleted sucessfully"})
    }
}

//get all the user details
exports.getAllUserDetails=async(req,res)=>{
    try {
        //get user id 
        const userId = req.user.id
        //get all details and validate
        const userDetails = await User.findById(userId).populate("additionalDetails").exec();
        if(!userDetails){
            return res.status(404).json({success:false, message:"user not found"})
        }
        //return response
        return res.status(200).json({success:true , message:"user details fetched"})
    } catch (error) {
        return res.status(500).json({sucess:false,message:"unable to fetch user details"})
    }
}