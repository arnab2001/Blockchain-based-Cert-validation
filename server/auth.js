const express = require("express");
const router = express.Router();
const University = require("../model/University");
const mongoose = require("mongoose");

router.post("/register", async (req, res) => {
  try {
    const newUniversity = new University(req.body);
    const savedUniversity = await newUniversity.save(); // Use async/await for clarity
    res.status(201).json({ message: "University registered successfully", university: savedUniversity });
  } catch (err) {
    // Handle validation errors and other database errors appropriately
    let errorMessage = "University registration failed";
    if (err.errors) {
      errorMessage = Object.values(err.errors).map(error => error.message).join(", ");
    } else {
      errorMessage += `: ${err.message}`;
    }
    res.status(400).json({ message: errorMessage }); // Consistent error code (400 for bad request)
  }
});

//login using wallet address only 
router.post("/login", async (req, res) => {
  try {
    const { publicAddress } = req.body;

    const university = await University.findOne({ publicAddress }); 
  
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.status(200).json({ message: "University found", university });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" , err: err.message});
  }
}
);


router.patch("/:id", async (req, res) => {
  try {

    const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!isValidId) {
      return res.status(400).json({ message: "Invalid university ID" });
    }


    const update = { $set: req.body };  // Uncomment for specific field updates
    const university = await University.findByIdAndUpdate(
      req.params.id,
      update,
      { new: false, upsert: false, runValidators: true }
    );
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.status(200).json({ message: "University updated successfully", university });
  } catch (err) {
    let errorMessage = "University update failed";
    if (err.errors) {
      errorMessage = Object.values(err.errors).map(error => error.message).join(", ");
    } else {
      errorMessage += `: ${err.message}`;
    }
    res.status(400).json({ message: errorMessage });
  }
}
);

router.get("/all", async (req, res) => {
  try {
    const universities = await University.find();
    res.status(200).json({ universities });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.status(200).json({ university });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}
);

module.exports = router;