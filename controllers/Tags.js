const Tags  = require("../models/Tags")

exports.createTag=async(req,res)=>{
    try{
        //get name and desc from req
        const {name , description} = req.body;
        //validate
        if(!name || !description){
            return res.status(400).json({sucess:false,message:"fill all details"})
        }
        //make entry in db
        await Tags.create({name:name , description:description})
        //send res 
        return res.status(200).json({success:true,message:"tag created successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(400).json({sucess:false, message:error.message})
    }
}
//show all the tags
exports.showAlltags=async(req,res)=>{
    try {
        //get all tags from db
        await Tags.find({} , {name:true, description:true})
        //send res
        return res.status(200).json({success:true, message:"all tags returned sucessfully"})
    } catch (error) {
        console.log(error)
        return res.status(400).json({sucess:false, message:error.message})
    }
}