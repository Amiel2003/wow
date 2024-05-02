const nodemailer = require('nodemailer')

function sendEmployeeCredentials(password,data){
    const html = `
    <h5>We are glad to announce that you have been accepted as ${data.role} in Ang Lechon Manok ni SR PEDRO<h/5>
    <h5>Login Credentials<h/5>
    <p>Username: ${data.username}</p>
    <p>Password: ${password}</p>
    `
    const htmlReg = `
    <h5>We are glad to announce that you have been accepted as ${data.role} in Ang Lechon Manok ni SR PEDRO<h/5>
    `

    let htmlContent;
    if (data.role !== 'cashier' && data.role !== 'supervisor') {
        htmlContent = htmlReg; // Use htmlReg if the role is not "cashier" or "supervisor"
    } else {
        htmlContent = html; // Use html if the role is "cashier" or "supervisor"
    }
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth:{
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_APP_PASSWORD,
        }
      })
    
      const mailOptions = {
        from: {
          name: 'SR PEDRO',
          address: process.env.NODEMAILER_USER
        },
        to: [data.email_address],
        subject: "Congratulations! You have been accepted!",
        text: "Congratulations! You have been accepted!",
        html: htmlContent
      }
    
      const sendMail = async (transporter,mailOptions) => {
        try {
          await transporter.sendMail(mailOptions)
          console.log('Email sent!!!!')
        } catch (error) {
          console.error('Error sendning memeail',error)
        }
      }
    
      sendMail(transporter,mailOptions)
    
}

module.exports = {sendEmployeeCredentials}