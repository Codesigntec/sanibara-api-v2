import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
});

const sendEmail = async (subject: string, message: string, to: string) => {
    try {
        var mailOptions = {
            from: process.env.MAIL_USERNAME,
            to,
            subject,
            text: message
        };
        const res = await transporter.sendMail(mailOptions)
        if(res.messageId) return true
        else return false
    } catch (error: any) {
        console.log("sending email error:", error.message)
        return false
    }
}

const sendConfirmationCodeByEmail = async (email: string, code: number): Promise<Boolean> => {
    const message = `${code} est votre code de confirmation.`
    return await sendEmail("Reinitialisation mot de passe", message, email)
}


export {
    sendConfirmationCodeByEmail
}