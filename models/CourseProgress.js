const mongoose = require('mongoose')

const courseProgressSchema = new mongoose.Schema({
  courseID:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course"
  },
  completedVideos:[
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"SubSection"
    }
  ]
})

const courseProgress = mongoose.model('courseProgress' , courseProgressSchema)
module.exports = courseProgress