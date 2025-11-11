const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
   courseName:{
    type:String
   },
   courseDescription:{
    type:String,
   },
   Instructor:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User"
   },
   whatYouWillLearn:{
    type:String,
   },
   courseContent:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Section"
   }
   ],
   ratingAndReviews:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"RatingAndReviews"
   },
   price:{
    type:String,
   },
   thumbnail:{
    type:String,
   },
   tag:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Tag"
   },
   studentEnrolled:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    }
   ]
})

const Course = mongoose.model('Course' , courseSchema)
module.exports = Course