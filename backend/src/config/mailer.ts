import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass:process.env.EMAIL_PASS
  },
});

export async function sendMail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <b>${otp}</b></p>`
    });
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}   