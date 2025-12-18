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

//verify signature of razorpay and server
exports.verifySignature=async(req,res)=>{
    //this is the weebhook/key is known by server(same entered in razorpay account)
    const webhookSecret = "123456"

    //signature will be send by the rezorpay in header(when payment is successfull, razorpay will hit an api given by account holder)
    const signature = req.headers("x-razorpay-signature")

    //convert webhook into signature using hash(Hmac)
    const shasum = crypto.createHmac("sha256",webhookSecret)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest("hex")

    if(signature === digest){
        console.log("payment is authorized")

        const {courseId , userId} = req.body.payload.payment.entity.notes;

        try {
            //fullfill the action

            //find the course and enroll the student 
            const enrolledCourse = await Course.findByIdAndUpdate(courseId , 
                                                        {$push:{
                                                            studentEnrolled:userId
                                                        }},
                                                        {new:true }
            )
            
            if(!enrolledCourse){
                return res.status(500).json({success:false,
                                              message:"Course not found "
                })
            }

            console.log(enrolledCourse)

            //find the student and add the course to their enrolled course
            const enrolledStudent = await User.findByIdAndUpdate(userId ,
                                                     {$push:{
                                                        courses:courseId
                                                     }},
                                                     {new:true}
            )

            console.log(enrolledStudent )

            //send confirmation mail
            const emailResponse = await mailSender(enrolledStudent.email , 
                                                   "Sucessfully enrolled in course" ,
                                                   "Congrulations , you successfully enrolld in the course !!"
            )

            console.log(emailResponse)
            return res.status(200).json({success:true, 
                                         message:"signature verified and course added"})
             
        } catch (error) {
            console.log(error)
            return res.status(500).json({success:false, message:error.message})
        }
    }
    else{
        return res.status(400).json({success:false ,
                                     message:"invalid request"
        }) 
    }

}