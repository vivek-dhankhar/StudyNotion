const Section = require('../models/Section')
const Course = require("../models/Course")

exports.createSection=async(req,res)=>{
    try{
        //get the data
        const {sectionName , courseId} = req.body
        //validate
        if(!sectionName || !courseId){
            return res.status(400).json({success:false,message:"all fields required"})
        }
        //create the section
        const newSection = await Section.create({sectionName})
        //update course with section (Objid)
        const updateCourseDetails = await Course.findByIdAndUpdate(courseId ,
                                                             {courseContent:newSection._id},
                                                              {new:true}
                                                             )
        //return response
        return res.status(200).json({success:true,
                                     message:"section created sucessfully" ,
                                     updateCourseDetails
                                    })
    }
    catch(error){
        return res.status(500).json({success:false,message:"section creation failed , try again"})
    }
}

//updateSection -------------------------------------
exports.updateSection=async(req,res)=>{
    try{
        //get the data 
        const {sectionName , sectionId} = req.body
        //validate
         if(!sectionName || !sectionId){
            return res.status(400).json({success:false,message:"all fields required"})
        }
        //update
        const section = await Section.findByIdAndUpdate(sectionId ,
                                                        {sectionName},
                                                        {new:true}
        )
        //return response
        return res.status(200).json({success:true,message:"section updated sucessfully"})
    }
    catch(error){
        return res.status(500).json({success:false,message:"section updation failed , try again"})
    }
}

//deleteSection -----------------------------------------------------
exports.deleteSection=async(req,res)=>{
    try {
        //get id - assuming that we are sendin id in params
        const {sectionId} = req.params
        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId)
        //return response
        return res.status(200).json({success:true,message:"section deleted sucessfully"})
    } catch (error) {
         return res.status(500).json({success:false,message:"section deletion failed , try again"})
    }
}

