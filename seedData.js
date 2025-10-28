const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const User = require('./models/User');
require('dotenv').config();

// Sample hospitals data
const hospitalsData = [
  {
    name: "City General Hospital",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    location: {
      type: "Point",
      coordinates: [-73.9857, 40.7484] // [longitude, latitude]
    },
    phone: "+1-555-0101",
    email: "info@citygeneral.com",
    departments: ["Emergency Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Internal Medicine"],
    facilities: ["ICU", "Emergency Room", "Pharmacy", "Laboratory", "Radiology"],
    rating: 4.2
  },
  {
    name: "Metropolitan Medical Center",
    address: {
      street: "456 Health Avenue",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210"
    },
    location: {
      type: "Point",
      coordinates: [-118.2437, 34.0522]
    },
    phone: "+1-555-0102",
    email: "contact@metromedical.com",
    departments: ["Neurology", "Surgery", "Dermatology", "Psychiatry", "Family Medicine"],
    facilities: ["MRI", "CT Scan", "Surgery Center", "Rehabilitation", "Cafeteria"],
    rating: 4.5
  },
  {
    name: "St. Mary's Healthcare",
    address: {
      street: "789 Wellness Boulevard",
      city: "Chicago",
      state: "IL",
      zipCode: "60601"
    },
    location: {
      type: "Point",
      coordinates: [-87.6298, 41.8781]
    },
    phone: "+1-555-0103",
    email: "info@stmarys.com",
    departments: ["Cardiology", "Oncology", "Pediatrics", "Radiology", "Urology"],
    facilities: ["Cancer Center", "Heart Center", "Pediatric Ward", "Parking", "Gift Shop"],
    rating: 4.7
  },
  {
    name: "Regional Health Institute",
    address: {
      street: "321 Medical Drive",
      city: "Houston",
      state: "TX",
      zipCode: "77001"
    },
    location: {
      type: "Point",
      coordinates: [-95.3698, 29.7604]
    },
    phone: "+1-555-0104",
    email: "contact@regionalhealth.com",
    departments: ["Emergency Medicine", "Internal Medicine", "Surgery", "Orthopedics", "Dermatology"],
    facilities: ["Trauma Center", "Surgical Suites", "Recovery Rooms", "Diagnostic Center"],
    rating: 4.0
  },
  {
    name: "University Medical Hospital",
    address: {
      street: "654 University Circle",
      city: "Boston",
      state: "MA",
      zipCode: "02101"
    },
    location: {
      type: "Point",
      coordinates: [-71.0589, 42.3601]
    },
    phone: "+1-555-0105",
    email: "info@universitymed.com",
    departments: ["Neurology", "Cardiology", "Psychiatry", "Family Medicine", "Pediatrics"],
    facilities: ["Research Center", "Teaching Hospital", "Library", "Conference Rooms"],
    rating: 4.8
  }
];

// Sample doctors data
const doctorsData = [
  {
    name: "Dr. John Smith",
    email: "john.smith@citygeneral.com",
    password: "password123",
    phone: "+1-555-1001",
    role: "doctor",
    specialization: "Cardiology"
  },
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@citygeneral.com",
    password: "password123",
    phone: "+1-555-1002",
    role: "doctor",
    specialization: "Pediatrics"
  },
  {
    name: "Dr. Michael Brown",
    email: "michael.brown@metromedical.com",
    password: "password123",
    phone: "+1-555-1003",
    role: "doctor",
    specialization: "Neurology"
  },
  {
    name: "Dr. Emily Davis",
    email: "emily.davis@metromedical.com",
    password: "password123",
    phone: "+1-555-1004",
    role: "doctor",
    specialization: "Dermatology"
  },
  {
    name: "Dr. Robert Wilson",
    email: "robert.wilson@stmarys.com",
    password: "password123",
    phone: "+1-555-1005",
    role: "doctor",
    specialization: "Oncology"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmanagement');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleared existing data');

    // Insert hospitals
    const hospitals = await Hospital.insertMany(hospitalsData);
    console.log(`Inserted ${hospitals.length} hospitals`);

    // Insert doctors with hospital references
    for (let i = 0; i < doctorsData.length; i++) {
      const doctorData = doctorsData[i];
      const hospitalIndex = i % hospitals.length; // Distribute doctors across hospitals
      
      doctorData.hospitalId = hospitals[hospitalIndex]._id;
      
      const doctor = new User(doctorData);
      await doctor.save();
    }
    
    console.log(`Inserted ${doctorsData.length} doctors`);
    console.log('Database seeded successfully!');
    
    // Display summary
    console.log('\n=== SEEDED DATA SUMMARY ===');
    console.log('Hospitals:');
    hospitals.forEach(hospital => {
      console.log(`- ${hospital.name} (${hospital.address.city}, ${hospital.address.state})`);
    });
    
    console.log('\nDoctors:');
    const doctors = await User.find({ role: 'doctor' }).populate('hospitalId', 'name');
    doctors.forEach(doctor => {
      console.log(`- ${doctor.name} - ${doctor.specialization} at ${doctor.hospitalId.name}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seeder
seedDatabase();