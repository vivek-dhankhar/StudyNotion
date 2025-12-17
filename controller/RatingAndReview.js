const Course = require('../models/Course')
const RatingAndReview = require("../models/RatingAndReview")
const mongoose = require("mongoose")

//creating rating and review
exports.createRating=async(req,res)=>{
    try {
        //get userid
        const userid = req.user.id
        //get data from body 
        const {rating , review , courseId } = req.body
        //check user enrolled in course or not 
        const courseDetails = await Course.findOne({_id:courseId,
                                         studentsEnrolled : {$elemMatch : {$eq: userid}}} 
        )
        if(!courseDetails){
            return res.status(404).json(
                {
                    success:false,
                    message:"user not enrolled in the course"
                }
            )
        }
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                            user:userid , 
                                                            course:courseId
                                                           })

        if(alreadyReviewed){
            return res.status(403).json(
                {
                    success:false ,
                    message:"user already reviewed the course"
                }
            )
        }
        //create rating 
        const ratingReview = await RatingAndReview.create({
                                                 rating ,
                                                 review , 
                                                 user:userid,
                                                 course:courseId
        })
        //update course with rating 
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId ,
                                                {
                                                    $push:{
                                                        ratingAndReviews:ratingReview._id
                                                    }
                                                },
                                                {new:true}
        )
        console.log(updatedCourseDetails)
        //return response
        return res.status(200).json(
            {
                success:true ,
                message:"rating and review created sucessfully",
                ratingReview
            }
        )
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success:false,
                message:error.message
            }
        )
    }
}

//get Average Rating
exports.getAverageRating = async(req,res) =>{
    try {
        //get course id 
        const {courseId} = req.body;

        //calculate  average rating
        const result = await RatingAndReview.aggregate([
                                      {$match:{
                                        course: new mongoose.Types.Array.ObjectId(courseId)
                                      }},
                                      {$group:{
                                        _id:null ,
                                        averageRating: {$avg: "$rating"}
                                      }}

        ])
        //return rating 
        if(result.length > 0){
            return res.status(200).json(
                {
                    success:true,
                    message:result[0].averageRating
                }
            )
        }
        //if no rating/review exists
         return res.status(200).json(
                {
                    success:true,
                    message:'average rating is 0 , no rating given till now',
                    averageRating:0,
                }
            )

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success:false,
                message:error.message
            }
        )
    }
}

//get all ratingAndReviews
exports.getAllRating = async(req,res) =>{
    try {
        const allReviews = await RatingAndReview.find({})
                                              .sort({rating: "desc"})
                                              .populate({
                                                path:"user",
                                                select:"firstName lastName email image"
                                              })
                                              .populate({
                                                path:"course",
                                                select:"courseName"
                                              })
                                              .exec();

    return res.status(200).json(
        {
            success:true,
            message:"all reviews fetched successfully",
            data:allReviews
        }
    )
    } catch (error) {
          console.log(error);
        return res.status(500).json(
            {
                success:false,
                message:error.message
            }
        )
    }
}
