const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const cloudinarySender = require("../utils/imageUploader");
require("dotenv").config()

exports.creatSection=async(req,res)=>{
    try {
        //get data from body
        const {sectionId ,title ,timeDuration , description} = req.body
        //get file/video
        const video = req.files.vidoeFile
        //validate
        if(!courseId || !title || !timeDuration ||!description || !video){
            return res.status(400).json({success:false,message:"all fields are required"})
        }
        //upload video to cloudinary
        const uploadDetails = await cloudinarySender(video,process.env.FOLDER_NAME)
        //create subsection 
        const subsectionDetails = await SubSection.create({title,
                                                          timeDuration,
                                                          description,
                                                          videoUrl:uploadDetails.secure_url}
                                                        )
        //update section with subsection ObjId
        const updatedSection = await Section.findByIdAndUpdate(sectionId,
                                        {$push:
                                            {subSection:subsectionDetails._id}},
                                        {new:true}
                                       )
        //return response
        return res.status(200).json({success:true,
                                     message:"subsection created sucessfully",
                                    updatedSection})
    } catch (error) {
        return res.status(500).json({success:false,
                                     message:"failed to create subsection , try again"}
                                    )
    }
}

//updateSubSection-------------------------------------------
exports.updateSubSection=async(req,res)=>{
    try {
        //get data from body 
        const {subSectionId , title ,timeDuration , description} = req.body
        const video = req.files.vidoeFile
        //validation
        if(!subSectionId||!title || !timeDuration ||!description || !video){
            return res.status(400).json({success:false,message:"all fields are required"})
        }
        //upload new video to cloudinary 
           const uploadDetails = await cloudinarySender(video,process.env.FOLDER_NAME)
        //update subsection by findByIdAndUpdate
        const updatedsubSection = await SubSection.findByIdAndUpdate(subSectionId ,
                                                                {title ,
                                                                 timeDuration , 
                                                                 description ,
                                                                videoUrl:uploadDetails.secure_url  
                                                                    })
        //return response
        return res.status(200).json({success:true,
                                     message:"subSection updated sucessfully",
                                     updatedsubSection 
                                      })
    } catch (error) {
        return res.status(500).json({success:false,
                                     message:"failed to update subsection , try again"}
                                    )
    }
}

//deleteSubSection-------------------------------------------------------
exports.deleteSubSection=async(req,res)=>{
    try {
        //get the subsection id - assumed it sends by us in params
        const {subSectionId} = req.params
        //findbyidandDelete on subsection
        await SubSection.findByIdAndDelete(subSectionId)
        //return response
        return res.status(200).json({success:true,message:"subSection deleted sucessfully"})
    } catch (error) {
        return res.status(500).json({success:false,message:"subSection deletion failed , try again"})
    }
}