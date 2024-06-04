const mongoose = require("mongoose"); // Assuming mongoose is installed

// Improved University schema with better validation and data types
const UniversitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3, // Enforce minimum name length
    maxlength: 100 // Set a reasonable maximum name length
  },
  publicAddress: {
    type: String,
    required: true,
    unique: true, // Ensure unique public address
    minlength: 3, // Set minimum length for public address
    maxlength: 50 // Set a reasonable maximum length
  },
  logo:{
    type: String,
    required: true,
    trim: true
  
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  courses: {
    type: [String], // Ensure array of strings for course names
    required: true,
    validate: {
      validator: (courses) => courses.length > 0, // Validate at least one course
      message: "University must have at least one course"
    }
  }
});

const University = mongoose.model("University", UniversitySchema);
module.exports = University;