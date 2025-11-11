const nodemailer = require("nodemailer")

const mailSender =async(email,title,body)=>{
    try {

        let transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                email:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        let info = transporter.sendMail({
            from:"StudyNotion || Codeby - Vivek Dhankhar",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        })
        console.log(info);
        return info;
    } 
    catch (error) {
        console.log(error)
    }
}

module.exports = mailSender