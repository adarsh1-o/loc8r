const express = require('express');
const Hospital = require('../models/Hospital');
const User = require('../models/User');

const router = express.Router();

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true });
    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hospitals by location (nearby)
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const hospitals = await Hospital.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctors by hospital
router.get('/:hospitalId/doctors', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { specialization } = req.query;

    let query = { hospitalId, role: 'doctor' };
    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await User.find(query)
      .select('name specialization email phone')
      .populate('hospitalId', 'name address');

    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new hospital (admin function)
router.post('/', async (req, res) => {
  try {
    const hospitalData = req.body;
    const hospital = new Hospital(hospitalData);
    await hospital.save();

    res.status(201).json({
      message: 'Hospital added successfully',
      hospital
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;