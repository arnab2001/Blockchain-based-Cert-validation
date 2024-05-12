const express = require("express");
const router = express.Router();
const Student = require("../model/Student");

router.post("/register", async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        const savedStudent = await newStudent.save();
        res.status(201).json({ message: "Student registered successfully", student: savedStudent });
    } catch (err) {
        let errorMessage = "Student registration failed";
        if (err.errors) {
        errorMessage = Object.values(err.errors).map(error => error.message).join(", ");
        } else {
        errorMessage += `: ${err.message}`;
        }
        res.status(400).json({ message: errorMessage });
    }
    }

);

router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;

        const student = await Student
        .findOne({ email });

        if (!student) {
        return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ message: "Student found", student });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" , err: err.message});
    }
    }

);

router.get("/:get", async (req, res) => {
    //find by id
    try {
        console.log(req.params.get);
        const student = await Student.findById(req.params.get);
        if (!student) {
        return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ message: "Student found", student });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" , err: err.message});
    }
    }

);

router.patch("/:id", async (req, res) => {
    try {

    const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!isValidId) {
        return res.status(400).json({ message: "Invalid student ID" });
    }

    const update = { $set: req.body };
    const student = await Student.findByIdAndUpdate(
        req.params.id,
        update,
        { new: false, upsert: false, runValidators: true }
    );
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student updated successfully", student });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" , err: err.message});
    }
    }

);

module.exports = router;