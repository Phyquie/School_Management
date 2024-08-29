const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const School = require('./modles/School');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB

const mongoconnectdb=() => {

    try {
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.log('MongoDB connection failed');
    }
}


// Add School API
app.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate input data
  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newSchool = new School({ name, address, latitude, longitude });
    await newSchool.save();
    res.status(201).json({ message: 'School added successfully', school: newSchool });
  } catch (error) {
    res.status(500).json({ message: 'Error adding school', error });
  }
});

// List Schools API
app.get('/',async (req,res)=>{
    res.send('Use /addSchool to add school and /listSchools to list schools');
})
app.get('/listSchools', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  try {
    const schools = await School.find({});
    
    const sortedSchools = schools.map(school => {
      const distance = Math.sqrt(
        Math.pow(school.latitude - latitude, 2) + Math.pow(school.longitude - longitude, 2)
      );
      return { ...school.toObject(), distance };
    }).sort((a, b) => a.distance - b.distance);

    res.status(200).json(sortedSchools);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schools', error });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mongoconnectdb();
});
