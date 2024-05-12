const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    universityId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'University'
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    university: {
        type: String,
        required: true,
        trim: true
    },
    //curriculam data with json type
    metaData: {
        type: Object,
        required: true
    
    }

    
    });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;