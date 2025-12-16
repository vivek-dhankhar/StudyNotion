const {instance} = require("../config/razorpay")
const Course = require('../models/Course')
const User = require('../models/User')
const {mailSender} = require('../utils/mailSender')

//capture the payment and initiate the razorpay order
exports.capturePayment=async(req,res)=>{
    try {
        //get userid and course id 
        const userId = req.user.id
        const {courseId} = req.body
        //validate courseid
        if(!courseId){
            return res.status(400).json({success:false, message:"courseid not valid"})
        }
        //validate courseDetails
        const courseDetails = await Course.findById(courseId);
        if(!courseDetails){
            return res.status(400).json({success:false,message:"could not find the course"})
        }
        //user already enrolled in the course
        const uid = mongoose.Types.ObjectId(userId)
        if(courseDetails.studentEnrolled.includes(uid)){
             return res.status(400).json({success:false,message:"student already enrolled"})
        }
        //create order
        const amount = courseDetails.price
        const currency = "INR"

        const options = {
            amount : amount *100,
            currency, 
            receipt : Math.random(Date.now()).toString() ,
            notes : {
                courseId ,
                userId
            }
        }
        const paymentResponse =await instance.orders.create(options)
        console.log(paymentResponse);

        //return response
        return res.status(200).json({success:true , 
                                     message:"order created sucessfully",
                                    courseName:courseDetails.courseName,
                                    courseDescription : courseDetails.courseDescription,
                                    courseThumbnail : courseDetails.thumbnail ,
                                    orderId : paymentResponse.id,
                                    currency : paymentResponse.currency,
                                    amount : paymentResponse.amount
                                    })
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false,message:error.message})
    }
}