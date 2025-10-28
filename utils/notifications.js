const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendNotification = async (appointment) => {
  try {
    const { patient, doctor, hospital, appointmentDate, timeSlot, reason } = appointment;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Appointment Confirmation - Health Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Appointment Confirmation</h2>
          
          <p>Dear ${patient.name},</p>
          
          <p>Your appointment has been successfully booked. Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c5aa0; margin-top: 0;">Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
            <p><strong>Specialization:</strong> ${doctor.specialization}</p>
            <p><strong>Hospital:</strong> ${hospital.name}</p>
            <p><strong>Address:</strong> ${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state}</p>
            <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${timeSlot}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #155724; margin-top: 0;">Important Instructions:</h4>
            <ul style="color: #155724;">
              <li>Please arrive 15 minutes before your appointment time</li>
              <li>Bring a valid ID and insurance card</li>
              <li>Bring any relevant medical records or test results</li>
              <li>Contact the hospital if you need to reschedule</li>
            </ul>
          </div>
          
          <p>If you have any questions, please contact the hospital at ${hospital.phone}</p>
          
          <p>Thank you for choosing our healthcare services!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = { sendNotification };