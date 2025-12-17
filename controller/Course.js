const User = require('../models/User');
const Tags = require("../models/Tags");
const Course = require('../models/Course')
const {cloudinarySender} = require("../utils/imageUploader")

//create the course
exports.createCourse=async(req,res)=>{
    try {
     //get data from body
     const {courseName,courseDescription,whatYouWillLearn,price,tag} = req.body;
     // get image/thumbnail
     const thumbnail = req.files.thumbnailImg;
     //validate - fiels are empty
     if (!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !tag) {
    return res.status(400).json({ success:false, message:"all fields are required" });
     }
     //check for instructor becoz we have to insert the objectid of instr. to course schema
     const userid = req.user.id
     const instructorDetails = await User.findById(userid)
     console.log(instructorDetails)
     
     //validate tag , hai bhi ki nhi
      const tagDetails = await Tags.findById(tag)
      if(!tagDetails){
        return res.status(400).json({success:false, message:"there is no such tag"})
      }
     //cloudinary pe img upload 
     const thumbnailImage = await cloudinarySender(thumbnail, process.env.FOLDER_NAME)
     //db mai entry course schema ki 
     const newCourse = await Course.create({courseName,courseDescription,instructor:instructorDetails._id,whatYouWillLearn,price,tag:tagDetails._id,thumbnail:thumbnailImage.secure_url})
     //user update about course of insructor becoz he do not need to buy
     await User.findOneAndUpdate({_id:instructorDetails._id} , {$push:{courses:dbcourse}})
     //tag update about the course
     await Tags.findOneAndUpdate({_id:tagDetails._id} , {$push:{course:newCourse}})
     // send response
     return res.status(200).json({success:true , message:"Course created sucessfully " ,data:newCourse})
    } catch (error) {
        console.error(err)
        return res.status(400).json({success:false, message:"Failed to create course",error:error.message}
        )
    }
}

//get all courses 
exports.showAllCourses=async()=>{
    try {
        const allCourses = await Course.find({})
        return res.status(200).json({success:true,message:"data for all courses fetched sucessfully" ,data:allCourses})
    } catch (error) {
        console.log(error)
        return res.status(400).json({success:false,message:"connot fetch course data" ,error:error.message})
    }
}

//get all courseDetails
exports.getCourseDetails =async(req,res)=>{
    try {
        //get id
        const {courseId} = req.body
        //find course details 
        const courseDetails = await Course.find(
                                      {_id:courseId})
                                      .populate(
                                        {
                                            path:"instructor" ,
                                            populate:{
                                                path:"additionalDetails"
                                            }
                                        }
                                      )
                                      .populate("category")
                                      .populate("ratingAndReviews")
                                      .populate(
                                        {
                                            path:"courseContent" ,
                                            populate:{
                                                path:"subSection"
                                            }
                                        }
         )

        //validate
        if(!courseDetails){
            return res.status(400).json(
                {
                    success:false,
                    message:`could not find the course details of id ${courseId}`
                }
            )
        }

        //return response 
        return res.status(200).json(
            {
                success:true,
                message:"course details fetched successfully",
                data:courseDetails
            }
        )

    
    } catch (error) {
        console.log(error)
        return res.status(500).json(
            {
                success:false,
                message:error.message
            }
        )
    }
}