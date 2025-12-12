const cloudinary = require("cloudinary").v2;

const cloudinarySender=async(file,folder)=>{
    await cloudinary.config({
        cloud_name:process.env.CLOUD_NAME,
        secret_key:process.env.SECRET_KEY,
        folder_name:process.env.FOLDER_NAME,
    })

    await cloudinary.uploader.upload(file.tempFilePath , {folder})
}