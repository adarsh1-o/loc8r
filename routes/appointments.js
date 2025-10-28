const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendNotification } = require('../utils/notifications');
const auth = require('../middleware/auth');

const router = express.Router();

// Book Appointment
router.post('/book', auth, async (req, res) => {
  try {
    const { doctorId, hospitalId, appointmentDate, timeSlot, reason, symptoms } = req.body;
    const patientId = req.user.userId;

    // Check if doctor exists and is available
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'Doctor not found' });
    }

    // Check for existing appointment at the same time
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      hospital: hospitalId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      symptoms: symptoms || []
    });

    await appointment.save();

    // Populate appointment details
    await appointment.populate(['patient', 'doctor', 'hospital']);

    // Send notification
    await sendNotification(appointment);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user appointments
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'patient') {
      query.patient = userId;
    } else if (userRole === 'doctor') {
      query.doctor = userId;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .populate('hospital', 'name address phone')
      .sort({ appointmentDate: 1 });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate(['patient', 'doctor', 'hospital']);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment status updated',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;