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

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}