import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 12,
            maxlength: 50
        },

        schoolName: {
            type: String,
            required: true,
            trim: true,
            minlength: 12,
            maxlength: 50
        },

        grade: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 30
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            minlength: 12,
            maxlength: 50
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        language: {
            type: String,
            required: true,
            enum: ["en", "si", "ta"]
        }
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;