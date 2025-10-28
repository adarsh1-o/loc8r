const express = require('express');
const { sendNotification } = require('../utils/notifications');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Send notification for appointment
router.post('/send/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .populate('hospital', 'name address');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await sendNotification(appointment);
    
    // Update notification status
    appointment.notificationSent = true;
    await appointment.save();

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;